import {
  Tenders,
  TenderResponses,
  FeedbackResponses,
  BlockedCompanies,
  Audits,
} from '../../db/models';

export default {
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

  async openTendersCount(company) {
    const responses = await TenderResponses.find({ supplierId: company._id });
    const submittedTenderIds = responses.map(r => r.tenderId);

    const openTenders = await Tenders.find({
      _id: { $nin: submittedTenderIds },
      supplierIds: { $in: [company._id] },
      status: 'open',
    });

    return openTenders.length;
  },

  audits(company) {
    return Audits.find({ supplierIds: { $in: [company._id] }, status: { $ne: 'draft' } });
  },
};
