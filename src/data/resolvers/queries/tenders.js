import { Tenders, TenderResponses } from '../../../db/models';
import { paginate } from './utils';

const tenderQueries = {
  /**
   * Tenders list
   * @param {Object} args - Query params
   * @return {Promise} filtered tenders list by given parameters
   */
  async tenders(root, args, { user }) {
    const { type, supplierId, ignoreNotInterested, ignoreSubmitted, ...params } = args;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (supplierId) {
      query.supplierIds = { $in: [supplierId] };
    }

    if (ignoreNotInterested) {
      query.isNotInterested = { $ne: true };
    }

    if (ignoreSubmitted) {
      const submittedTenders = await TenderResponses.find({ supplierId: user.companyId });
      const submittedTenderIds = submittedTenders.map(response => response.tenderId);

      query._id = { $nin: submittedTenderIds };
    }

    return paginate(Tenders.find(query), params);
  },

  /**
   * Get one tender
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found tender
   */
  tenderDetail(root, { _id }) {
    return Tenders.findOne({ _id });
  },
};

export default tenderQueries;
