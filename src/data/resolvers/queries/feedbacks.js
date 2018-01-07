import { Feedbacks } from '../../../db/models';
import { paginate } from './utils';

const feedbackQueries = {
  /**
   * Feedbacks list
   * @param {Object} args - Query params
   * @return {Promise} filtered feedbacks list by given parameters
   */
  async feedbacks(root, args) {
    const feedbacks = await Feedbacks.find({});

    return paginate(feedbacks, args);
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
};

export default feedbackQueries;
