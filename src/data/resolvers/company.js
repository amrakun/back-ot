import {
  Tenders,
  TenderResponses,
  FeedbackResponses,
  BlockedCompanies,
  Qualifications,
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

  async prequalifiedStatus(company) {
    const qualif = await Qualifications.findOne({ supplierId: company._id });

    if (!qualif) {
      return {
        financialInfo: false,
        businessInfo: false,
        environmentalInfo: false,
        healthInfo: false,
      };
    }

    return {
      financialInfo: Qualifications.isSectionPassed(qualif.financialInfo),
      businessInfo: Qualifications.isSectionPassed(qualif.businessInfo),
      environmentalInfo: Qualifications.isSectionPassed(qualif.environmentalInfo),
      healthInfo: Qualifications.isSectionPassed(qualif.healthInfo),
    };
  },
};
