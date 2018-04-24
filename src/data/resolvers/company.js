import {
  Tenders,
  TenderResponses,
  FeedbackResponses,
  BlockedCompanies,
  Qualifications,
  Audits,
} from '../../db/models';

export default {
  lastProductsInfoValidation(company) {
    return company.getLastProductsInfoValidation();
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

    const stats = {
      financialInfo: false,
      businessInfo: false,
      environmentalInfo: false,
      healthInfo: false,
      isApproved: false,
      isOutstanding: false,
      isFailed: false,
      isExpired: false,
    };

    if (!qualif) {
      return stats;
    }

    stats.financialInfo = Qualifications.isSectionPassed(qualif.financialInfo);
    stats.businessInfo = Qualifications.isSectionPassed(qualif.businessInfo);
    stats.environmentalInfo = Qualifications.isSectionPassed(qualif.environmentalInfo);
    stats.healthInfo = Qualifications.isSectionPassed(qualif.healthInfo);

    const status = await Qualifications.status(company._id);

    return { ...stats, ...status };
  },

  tierTypeDisplay(company) {
    switch (company.tierType) {
      case 'tier1':
        return 'Tier 1';

      case 'tier2':
        return 'Tier 2';

      case 'tier3':
        return 'Tier 3';

      case 'national':
        return 'National';

      default:
        return 'Umnugovi';
    }
  },

  prequalificationStatusDisplay(company) {
    if (typeof company.isPrequalified === 'undefined') {
      return 'In process';
    }

    return company.isPrequalified ? 'Pre-qualified' : 'Not-qualified';
  },

  qualificationStatusDisplay(company) {
    if (typeof company.isQualified === 'undefined') {
      return 'n/a';
    }

    return company.isQualified ? 'Qualified' : 'Not-qualified';
  },

  productsInfoValidationStatusDisplay(company) {
    if (typeof company.isProductsInfoValidated === 'undefined') {
      return 'In process';
    }

    return company.isProductsInfoValidated ? 'Validated' : 'Not-validated';
  },

  async isBlocked(company) {
    const isBlocked = await BlockedCompanies.isBlocked(company._id);

    return isBlocked ? 'Blocked' : 'n/a';
  },
};
