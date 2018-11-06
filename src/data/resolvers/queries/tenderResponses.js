import { Companies, Tenders, TenderResponses } from '../../../db/models';
import { encrypt, decryptArray } from '../../../db/models/utils';
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

    const sortName = sort.name;
    const sortProductCode = sort.productCode;

    // filter by interest
    if (isNotInterested !== undefined) {
      query.isNotInterested = isNotInterested;
    }

    let responses = await TenderResponses.find(query);

    // search by between values =========
    // filter by sub field value
    const filterBySubField = name =>
      responses.filter(tender => {
        const { minValue, maxValue, productCode } = betweenSearch;

        const respondedProducts = tender.respondedProducts || [];
        const product = respondedProducts.find(p => p.code === productCode);

        return product && product[name] >= minValue && product[name] <= maxValue;
      });

    // totalPrice
    if (betweenSearch.name === 'totalPrice') {
      responses = filterBySubField('totalPrice');
    }

    // unit price
    if (betweenSearch.name === 'unitPrice') {
      responses = filterBySubField('unitPrice');
    }

    // lead time
    if (betweenSearch.name === 'leadTime') {
      responses = filterBySubField('leadTime');
    }

    // sort by sub field value ===================
    const sortBySubField = name =>
      responses.sort((doc1, doc2) => {
        if (!sortProductCode) {
          return;
        }

        // doc1's responded product for productCode
        const d1p = (doc1.respondedProducts || []).find(p => p.code === sortProductCode);

        // doc2's responded product for productCode
        const d2p = (doc2.respondedProducts || []).find(p => p.code === sortProductCode);

        if (d1p && d2p) {
          return d1p[name] > d2p[name];
        }
      });

    // minimum unit price
    if (sortName === 'minUnitPrice') {
      responses = sortBySubField('unitPrice');
    }

    // minimum lead time
    if (sortName === 'minLeadTime') {
      responses = sortBySubField('leadTime');
    }

    // minimum total price
    if (sortName === 'minTotalPrice') {
      responses = sortBySubField('totalPrice');
    }

    return responses;
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
