import { Feedbacks } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const feedbackMutations = {
  /**
   * Create new feedback
   * @param {Object} doc - feedbacks fields
   * @return {Promise} newly created feedback object
   */
  async feedbacksAdd(root, doc, { user }) {
    return Feedbacks.createFeedback(doc, user._id);
  },
};

moduleRequireLogin(feedbackMutations);

export default feedbackMutations;
