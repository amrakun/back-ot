import { Tenders, FeedbackResponses } from '../../db/models';

export default {
  tenders(company) {
    return Tenders.find({ supplierIds: { $in: company._id } });
  },

  lastDifotScore(company) {
    return company.getLastDifotScore();
  },

  lastDueDiligence(company) {
    return company.getLastDueDiligence();
  },

  feedbacks(company) {
    return company.getFeedbacks();
  },

  async lastFeedback(company) {
    const feedback = await company.getLastFeedback();

    const supplierResponse = await FeedbackResponses.findOne({
      feedbackId: feedback._id,
      supplierId: company._id,
    });

    return {
      ...feedback.toJSON(),
      supplierResponse,
    };
  },
};
