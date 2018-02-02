import { Audits, AuditResponses } from '../../../db/models';
import { requireBuyer, requireSupplier } from '../../permissions';
import { supplierFilter } from './utils';

const auditQueries = {
  /**
   * Audits list
   */
  audits() {
    return Audits.find({});
  },

  /**
   * Audit detail
   */
  auditDetail(root, { _id }) {
    return Audits.findOne({ _id });
  },

  /**
   * Audit responses
   */
  async auditResponses(root, { supplierSearch, isFileGenerated, publishDate, closeDate }) {
    const query = {
      $and: [await supplierFilter({}, supplierSearch)],
    };

    if (publishDate && closeDate) {
      const audits = await Audits.find({
        publishDate: { $gte: publishDate },
        closeDate: { $lte: closeDate },
      });

      const auditIds = audits.map(audit => audit._id);

      query.$and.push({ auditId: { $in: auditIds } });
    }

    if (isFileGenerated) {
      query.$and.push({
        $or: [{ improvementPlanFile: { $ne: null } }, { reportFile: { $ne: null } }],
      });
    }

    return AuditResponses.find(query);
  },

  /**
   * Audit response total counts
   */
  async auditResponseTotalCounts() {
    const audits = await Audits.find({});

    let invited = 0;
    let notResponded = 0;
    let qualified = 0;
    let sentImprovementPlan = 0;

    for (const audit of audits) {
      const supplierIds = audit.supplierIds || [];

      invited += supplierIds.length;

      const responses = await AuditResponses.find({ auditId: audit._id });

      notResponded += supplierIds.length - responses.length;

      qualified += responses.filter(r => r.isQualified).length;
      sentImprovementPlan += responses.filter(r => r.improvementPlanSentDate).length;
    }

    return {
      invited,
      notResponded,
      qualified,
      sentImprovementPlan,
    };
  },

  /**
   * Audit response detail
   */
  auditResponseDetail(root, { auditId, supplierId }) {
    return AuditResponses.findOne({ auditId, supplierId });
  },

  /**
   * Audit response by logged in user
   */
  auditResponseByUser(root, { auditId }, { user }) {
    return AuditResponses.findOne({ auditId, supplierId: user.companyId });
  },
};

requireBuyer(auditQueries, 'audits');
requireBuyer(auditQueries, 'auditDetail');
requireBuyer(auditQueries, 'auditResponses');
requireBuyer(auditQueries, 'auditResponseDetail');

requireSupplier(auditQueries, 'auditResponseByUser');

export default auditQueries;
