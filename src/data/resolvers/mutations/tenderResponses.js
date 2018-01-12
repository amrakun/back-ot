import { TenderResponses } from '../../../db/models';
import { moduleRequireSupplier } from '../../permissions';

const tenderResponseMutations = {
  /**
   * Create new tender response
   * @param {Object} doc - tender response fields
   * @return {Promise} newly created tender reponse object
   */
  tenderResponsesAdd(root, doc) {
    return TenderResponses.createTenderResponse(doc);
  },
};

moduleRequireSupplier(tenderResponseMutations);

export default tenderResponseMutations;
