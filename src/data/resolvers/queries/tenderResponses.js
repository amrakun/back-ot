import { Companies, Tenders, TenderResponses } from '../../../db/models';
import { decrypt, encrypt, decryptArray } from '../../../db/models/utils';
import { requireBuyer, requireSupplier } from '../../permissions';
import { supplierFilter } from './utils';

const tenderResponseQueries = {
  /**
   * TenderResponses list
   * @param {Object} args - Query params
   * @return {Promise} filtered tenderResponses list by given parameters
   */
  async tenderResponses(root, args) {
    const { tenderId, sort = {}, betweenSearch = {}, supplierSearch, isNotInterested } = args;

    const tender = await Tenders.findOne({ _id: tenderId });

    // do not show open tender's responses
    if (tender.status === 'open') {
      return [];
    }

    const query = await supplierFilter({ tenderId, isSent: true }, supplierSearch, ids =>
      ids.map(id => encrypt(id.toString())),
    );

    // filter by interest
    if (isNotInterested !== undefined) {
      query.isNotInterested = isNotInterested;
    }

    const { name, minValue, maxValue, productCode } = betweenSearch;

    if (name && productCode) {
      query.respondedProducts = {
        $elemMatch: {
          code: productCode,
          [name]: { $gte: parseFloat(minValue), $lte: parseFloat(maxValue) },
        },
      };
    }

    let aggregations = [{ $match: query }];

    const sortName = sort.name;
    const sortProductCode = sort.productCode;

    let subField;

    if (sortName === 'minUnitPrice') {
      subField = 'unitPrice';
    }

    // minimum lead time
    if (sortName === 'minLeadTime') {
      subField = 'leadTime';
    }

    // minimum total price
    if (sortName === 'minTotalPrice') {
      subField = 'totalPrice';
    }

    if (sortName && sortProductCode) {
      aggregations = [
        ...aggregations,
        {
          $addFields: {
            rps: {
              $filter: {
                input: '$respondedProducts',
                as: 'respondedProduct',
                cond: { $eq: ['$$respondedProduct.code', sortProductCode] },
              },
            },
          },
        },
        {
          $unwind: '$rps',
        },
        {
          $sort: { [`rps.${subField}`]: 1 },
        },
      ];
    }

    const responses = await TenderResponses.aggregate(aggregations);

    return responses.map(response => ({
      ...response,
      supplierId: decrypt(response.supplierId),
    }));
  },

  /**
   * Get one tenderResponse
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found tenderResponse
   */
  tenderResponseDetail(root, { _id }) {
    return TenderResponses.findOne({ _id });
  },

  /**
   * Not responded suppliers
   * @param {String} tenderId - Tender id
   * @return {Promise} - Companies list
   */
  async tenderResponseNotRespondedSuppliers(root, { tenderId }) {
    const tender = await Tenders.findOne({ _id: tenderId });
    const responses = await TenderResponses.find({ tenderId });
    const responededSupplierIds = responses.map(response => encrypt(response.supplierId));

    const notRespondedSupplierIds = tender.supplierIds.filter(
      supplierId => !responededSupplierIds.includes(supplierId),
    );

    return Companies.find({ _id: { $in: decryptArray(notRespondedSupplierIds) } });
  },

  /**
   * Get response by logged in user
   */
  async tenderResponseByUser(root, { tenderId }, { user }) {
    const responses = await TenderResponses.find({ tenderId });

    return responses.find(res => res.supplierId === user.companyId);
  },
};

requireBuyer(tenderResponseQueries, 'tenderResponses');
requireBuyer(tenderResponseQueries, 'tenderResponseDetail');
requireBuyer(tenderResponseQueries, 'tenderResponseNotRespondedSuppliers');
requireSupplier(tenderResponseQueries, 'tenderResponseByUser');

export default tenderResponseQueries;
