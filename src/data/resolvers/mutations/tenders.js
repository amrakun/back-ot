import { Tenders } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  tendersAdd(root, doc) {
    return Tenders.createTender(doc);
  },

  /**
   * Update tender
   * @param {String} _id - tenders id
   * @param {Object} fields - tenders fields
   * @return {Promise} updated tender object
   */
  tendersEdit(root, { _id, ...fields }) {
    return Tenders.updateTender(_id, fields);
  },

  /**
   * Delete tender
   * @param {String} doc - tenders fields
   * @return {Promise}
   */
  tendersRemove(root, { _id }) {
    return Tenders.removeTender(_id);
  },

  /**
   * Choose winner
   * @param {String} _id - Tender id
   * @param {String} responseId - Tender response id
   * @return {Promise} - updated tender
   */
  tendersAward(root, { _id, responseId }) {
    return Tenders.award(_id, responseId);
  },
};

moduleRequireLogin(tenderMutations);

export default tenderMutations;
