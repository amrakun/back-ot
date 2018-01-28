import { TenderResponses } from '../../../db/models';
import { moduleRequireSupplier } from '../../permissions';

const tenderResponseMutations = {
  /**
   * Create new tender response
   * @param {Object} doc - tender response fields
   * @return {Promise} newly created tender reponse object
   */
  tenderResponsesAdd(root, doc, { user }) {
    return TenderResponses.createTenderResponse({ ...doc, supplierId: user.companyId });
  },

  /**
   * Update existing tender response
   * @param {Object} doc - tender response fields
   * @return {Promise} updated tender reponse object
   */
  tenderResponsesEdit(root, doc, { user }) {
    return TenderResponses.updateTenderResponse({ ...doc, supplierId: user.companyId });
  },

  /**
   * Mark tender response as sent
   */
  async tenderResponsesSend(root, doc) {
    const response = await TenderResponses.findOne(doc);

    if (response) {
      return response.send();
    }

    return null;
  },
};

moduleRequireSupplier(tenderResponseMutations);

export default tenderResponseMutations;
