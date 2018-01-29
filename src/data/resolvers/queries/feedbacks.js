import { Companies, Feedbacks, FeedbackResponses } from '../../../db/models';
import { requireBuyer } from '../../permissions';

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
  async feedbackResponses(root, { supplierName }) {
    const query = {};

    if (supplierName) {
      const suppliers = await Companies.find({
        $or: [
          { 'basicInfo.mnName': new RegExp(`.*${supplierName}.*`, 'i') },
          { 'basicInfo.enName': new RegExp(`.*${supplierName}.*`, 'i') },
        ],
      });

      const supplierIds = suppliers.map(s => s._id);

      query.supplierId = { $in: supplierIds };
    }

    return FeedbackResponses.find(query);
  },
};

requireBuyer(feedbackQueries, 'feedbacks');
requireBuyer(feedbackQueries, 'feedbackResponses');

export default feedbackQueries;
