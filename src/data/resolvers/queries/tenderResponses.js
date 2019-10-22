import { Companies, Tenders, TenderResponses } from '../../../db/models';
import { decrypt, encrypt } from '../../../db/models/utils';
import { requireBuyer, requireSupplier } from '../../permissions';
import { paginate, supplierFilter } from './utils';

const tenderResponsesFilter = async args => {
  const { tenderId, betweenSearch = {}, supplierSearch, isNotInterested } = args;

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

  return query;
};

const tenderResponseQueries = {
  /**
   * TenderResponses list
   * @param {Object} args - Query params
   * @return {Promise} filtered tenderResponses list by given parameters
   */
  async tenderResponses(root, args) {
    const { tenderId, sort = {} } = args;

    const tender = await Tenders.findOne({ _id: tenderId });

    // do not show open tender's responses
    if (tender.status === 'open') {
      return [];
    }

    const query = await tenderResponsesFilter(args);

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

    const { page, perPage } = args;
    const _page = Number(page || '1');
    const _limit = Number(perPage || '15');

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

    aggregations = [
      ...aggregations,
      {
        $skip: (_page - 1) * _limit,
      },
      {
        $limit: _limit,
      },
    ];

    const responses = await TenderResponses.aggregate(aggregations);

    return responses.map(response => ({
      ...response,
      supplierId: decrypt(response.supplierId),
    }));
  },

  /**
   * TenderResponses total count
   * @param {Object} args - Query params
   * @return {Promise} number
   */
  async tenderResponsesTotalCount(root, args) {
    const { tenderId } = args;

    const tender = await Tenders.findOne({ _id: tenderId });

    // do not show open tender's responses
    if (tender.status === 'open') {
      return 0;
    }

    const query = await tenderResponsesFilter(args);

    return TenderResponses.find(query).count();
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
  async tenderResponseNotRespondedSuppliers(root, args) {
    const { tenderId } = args;
    const tender = await Tenders.findOne({ _id: tenderId });
    const allSupplierIds = await tender.getAllPossibleSupplierIds();

    const responses = await TenderResponses.find({ tenderId, isSent: true });
    const responededSupplierIds = responses.map(response => response.supplierId);

    const notRespondedSupplierIds = allSupplierIds.filter(
      supplierId => !responededSupplierIds.includes(supplierId),
    );

    const selector = { _id: { $in: notRespondedSupplierIds } };

    return {
      list: await paginate(Companies.find(selector), args),
      totalCount: await Companies.find(selector).count(),
    };
  },

  /**
   * All invited suppliers
   * @param {String} tenderId - Tender id
   * @return {Promise} - Companies list
   */
  async tenderResponseInvitedSuppliers(root, args) {
    const { tenderId } = args;
    const tender = await Tenders.findOne({ _id: tenderId });
    const allSupplierIds = await tender.getAllPossibleSupplierIds();

    const selector = { _id: { $in: allSupplierIds } };

    return {
      list: await paginate(Companies.find(selector), args),
      totalCount: await Companies.find(selector).count(),
    };
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
requireBuyer(tenderResponseQueries, 'tenderResponsesTotalCount');
requireBuyer(tenderResponseQueries, 'tenderResponseDetail');
requireBuyer(tenderResponseQueries, 'tenderResponseNotRespondedSuppliers');
requireBuyer(tenderResponseQueries, 'tenderResponseInvitedSuppliers');
requireSupplier(tenderResponseQueries, 'tenderResponseByUser');

export default tenderResponseQueries;
