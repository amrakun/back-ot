import { FeedbackResponses } from '../../db/models';

export default {
  async responses(feedback) {
    return FeedbackResponses.find({ feedbackId: feedback._id });
  },
};
