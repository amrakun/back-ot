import { FeedbackResponses } from '../../../db/models';
import { moduleRequireSupplier } from '../../permissions';

const feedbackResponseMutations = {
  /**
   * Create new feedbackResponse
   * @param {Object} doc - feedbackResponses fields
   * @return {Promise} newly created feedbackResponse object
   */
  feedbackResponsesAdd(root, doc) {
    return FeedbackResponses.createFeedbackResponse(doc);
  },
};

moduleRequireSupplier(feedbackResponseMutations);

export default feedbackResponseMutations;
