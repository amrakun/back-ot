import { Companies } from '../../../db/models';
import { paginate } from './utils';

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { ids, ...params }) {
    if (params.ids) {
      return paginate(Companies.find({ _id: { $in: ids } }), params);
    }

    return paginate(Companies.find({}), params);
  },

  /**
   * Get one company
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found company
   */
  companyDetail(root, { _id }) {
    return Companies.findOne({ _id });
  },
};

export default companyQueries;
