import { Feedbacks, Companies } from '../../db/models';

export default {
  feedback(feedbackResponse) {
    return Feedbacks.findOne({ _id: feedbackResponse.feedbackId });
  },

  supplier(feedbackResponse) {
    return Companies.findOne({ _id: feedbackResponse.supplierId });
  },
};
