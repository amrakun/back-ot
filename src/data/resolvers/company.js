import {
  Tenders,
  TenderResponses,
  FeedbackResponses,
  Qualifications,
  Audits,
  AuditResponses,
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
    const responses = await TenderResponses.find({
      supplierId: company._id,
    });

    const submittedTenderIds = responses.map(r => r.tenderId);

    const openTenders = await Tenders.find({
      _id: { $nin: submittedTenderIds },
      supplierIds: { $in: [company._id] },
      status: 'open',
    });

    return openTenders.length;
  },

  audits(company) {
    return Audits.find({
      supplierIds: { $in: [company._id] },
      status: { $ne: 'draft' },
    });
  },

  async auditImprovementPlanNotification(company) {
    const openAudits = await Audits.find({
      supplierIds: { $in: [company._id] },
      status: 'open',
    });

    let result;

    for (const audit of openAudits) {
      const response = await AuditResponses.findOne({
        auditId: audit._id,
        supplierId: company._id,
        isQualified: false,
        isSupplierNotified: false,
      });

      if (response) {
        result = response;
        break;
      }
    }

    return result;
  },

  async hasNewAudit(company) {
    const openAudits = await Audits.find({
      supplierIds: { $in: [company._id] },
      status: 'open',
    });

    let result = false;

    for (const openAudit of openAudits) {
      const response = await AuditResponses.findOne({
        auditId: openAudit._id,
        supplierId: company._id,
      });

      if (!response) {
        result = true;
        break;
      }
    }

    return result;
  },

  async prequalifiedStatus(company) {
    const qualif = await Qualifications.findOne({ supplierId: company._id });

    const stats = {
      financialInfo: false,
      businessInfo: false,
      environmentalInfo: false,
      healthInfo: false,
      isApproved: false,
      isOutstanding: true,
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
    return company.tierTypeDisplay();
  },

  prequalificationStatusDisplay(company) {
    return company.prequalificationStatusDisplay();
  },

  qualificationStatusDisplay(company) {
    return company.qualificationStatusDisplay();
  },

  productsInfoValidationStatusDisplay(company) {
    return company.productsInfoValidationStatusDisplay();
  },

  isBlocked(company) {
    return company.isBlocked();
  },
};
