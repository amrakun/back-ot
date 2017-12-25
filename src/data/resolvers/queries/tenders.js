import { Tenders } from '../../../db/models';
import { paginate } from './utils';

const tenderQueries = {
  /**
   * Tenders list
   * @param {Object} args - Query params
   * @return {Promise} filtered tenders list by given parameters
   */
  async tenders(root, { type, ...params }) {
    const query = {};

    if (type) {
      query.type = type;
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
