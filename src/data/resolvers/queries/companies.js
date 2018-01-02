import { Companies } from '../../../db/models';
import { paginate } from './utils';

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { search, productCodes, _ids, ...params }) {
    const selector = { basicInfo: { $ne: null } };

    // main filter
    if (search) {
      selector.$or = [
        { 'basicInfo.mnName': new RegExp(`.*${search}.*`, 'i') },
        { 'basicInfo.enName': new RegExp(`.*${search}.*`, 'i') },
        { 'basicInfo.sapNumber': new RegExp(`.*${search}.*`, 'i') },
      ];
    }

    // product & services filter
    if (productCodes) {
      selector.productsInfo = { $in: productCodes.split(',') };
    }

    // ids filter
    if (_ids) {
      selector._id = { $in: _ids };
    }

    return paginate(Companies.find(selector), params);
  },

  /**
   * Get logged in user's company
   * @param {Object} args
   * @return {Promise} found company
   */
  companyByUser(root, args, { user }) {
    return Companies.findOne({ _id: user.companyId });
  },

  /**
   * Get one company
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found company
   */
  companyDetail(root, args, { _id }) {
    return Companies.findOne({ _id });
  },
};

export default companyQueries;
