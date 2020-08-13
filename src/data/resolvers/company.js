import {
  Tenders,
  FeedbackResponses,
  Qualifications,
  Audits,
  AuditResponses,
  Users,
  DueDiligences,
} from '../../db/models';

import { tendersSupplierFilter } from './queries/tenders';

export default {
  owner(company) {
    return Users.findOne({ companyId: company._id });
  },

  lastProductsInfoValidation(company) {
    return company.getLastProductsInfoValidation();
  },

  lastDifotScore(company) {
    return company.getLastDifotScore();
  },

  lastDueDiligence({ _id }) {
    return DueDiligences.findOne({ supplierId: _id }).sort({ createdDate: 1 });
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
    const user = await Users.findOne({ companyId: company._id });

    if (!user) {
      return 0;
    }

    const query = await tendersSupplierFilter({ status: 'open' }, user);

    return Tenders.find(query).count();
  },

  audits(company) {
    return Audits.find({
      supplierIds: { $in: [company._id] },
      status: { $ne: 'draft' },
    });
  },

  async auditNotification(company) {
    const audits = await Audits.find({
      supplierIds: { $in: [company._id] },
    });

    const notNotifiedResponse = await AuditResponses.findOne({
      auditId: { $in: audits.map(a => a._id) },
      supplierId: company._id,
      isEditable: true,
      notificationForSupplier: { $exists: true, $nin: ['', null] },
    });

    if (!notNotifiedResponse) {
      return null;
    }

    return { type: notNotifiedResponse.notificationForSupplier, response: notNotifiedResponse };
  },

  async qualificationState(company) {
    let lastAudit;

    try {
      lastAudit = await Audits.getLastAudit(company._id);
    } catch (e) {
      if (e.message === 'No audit found') {
        return { isEditable: false, showToggleButton: false };
      }
    }

    const response = await AuditResponses.findOne({
      auditId: lastAudit._id,
      supplierId: company._id,
    });

    if (!response) {
      return { isEditable: false, showToggleButton: false };
    }

    return { isEditable: response.isEditable, showToggleButton: response.isSentResubmitRequest };
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
