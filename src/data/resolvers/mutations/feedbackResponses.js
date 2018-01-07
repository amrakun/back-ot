import { FeedbackResponses } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

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

moduleRequireLogin(feedbackResponseMutations);

export default feedbackResponseMutations;
