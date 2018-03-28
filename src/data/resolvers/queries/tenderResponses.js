import { TenderResponses } from '../../../db/models';
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

    const query = await supplierFilter({ tenderId, isSent: true }, supplierSearch);

    const sortName = sort.name;
    const sortProductCode = sort.productCode;

    // filter by interest
    if (isNotInterested !== undefined) {
      query.isNotInterested = isNotInterested;
    }

    let tenders = await TenderResponses.find(query);

    // search by between values =========
    // filter by sub field value
    const filterBySubField = name =>
      tenders.filter(tender => {
        const { minValue, maxValue, productCode } = betweenSearch;

        const respondedProducts = tender.respondedProducts || [];
        const product = respondedProducts.find(p => p.code === productCode);

        return product && product[name] >= minValue && product[name] <= maxValue;
      });

    // totalPrice
    if (betweenSearch.name === 'totalPrice') {
      tenders = filterBySubField('totalPrice');
    }

    // unit price
    if (betweenSearch.name === 'unitPrice') {
      tenders = filterBySubField('unitPrice');
    }

    // lead time
    if (betweenSearch.name === 'leadTime') {
      tenders = filterBySubField('leadTime');
    }

    // sort by sub field value ===================
    const sortBySubField = name =>
      tenders.sort((doc1, doc2) => {
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
      tenders = sortBySubField('unitPrice');
    }

    // minimum lead time
    if (sortName === 'minLeadTime') {
      tenders = sortBySubField('leadTime');
    }

    // minimum total price
    if (sortName === 'minTotalPrice') {
      tenders = sortBySubField('totalPrice');
    }

    return tenders;
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
   * Get response by logged in user
   */
  tenderResponseByUser(root, { tenderId }, { user }) {
    return TenderResponses.findOne({ tenderId, supplierId: user.companyId });
  },
};

requireBuyer(tenderResponseQueries, 'tenderResponses');
requireBuyer(tenderResponseQueries, 'tenderResponseDetail');
requireSupplier(tenderResponseQueries, 'tenderResponseByUser');

export default tenderResponseQueries;
