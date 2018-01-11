import { Tenders, FeedbackResponses, BlockedCompanies } from '../../db/models';

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

    if (!feedback) {
      return;
    }

    const supplierResponse = await FeedbackResponses.findOne({
      feedbackId: feedback._id,
      supplierId: company._id,
    });

    return {
      ...feedback.toJSON(),
      supplierResponse,
    };
  },

  isBlocked(company) {
    return BlockedCompanies.isBlocked(company._id);
  },
};
