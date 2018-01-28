import { TenderResponses } from '../../../db/models';
import { paginate } from './utils';
import { requireBuyer, requireSupplier } from '../../permissions';

const tenderResponseQueries = {
  /**
   * TenderResponses list
   * @param {Object} args - Query params
   * @return {Promise} filtered tenderResponses list by given parameters
   */
  async tenderResponses(root, params) {
    return paginate(TenderResponses.find({}), params);
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
