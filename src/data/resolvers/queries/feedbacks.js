import { Feedbacks, FeedbackResponses } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const feedbackQueries = {
  /**
   * Feedbacks list
   * @param {Object} args - Query params
   * @return {Promise} filtered feedbacks list by given parameters
   */
  async feedbacks() {
    return Feedbacks.find({}).sort({ createdDate: -1 });
  },

  /**
   * Get one feedback
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found feedback
   */
  feedbackDetail(root, { _id }) {
    return Feedbacks.findOne({ _id });
  },

  /**
   * Feedback responses list
   * @param {Object} args - Query params
   * @return {Promise} filtered feedback responses list by given parameters
   */
  async feedbackResponses() {
    return FeedbackResponses.find({});
  },
};

moduleRequireBuyer(feedbackQueries);

export default feedbackQueries;
