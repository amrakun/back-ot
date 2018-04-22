import { Audits, AuditResponses } from '../../../db/models';
import { requireBuyer, requireSupplier } from '../../permissions';
import { supplierFilter } from './utils';

/*
 * Common audit responses filter
 */
const responsesFilter = async args => {
  const { status, supplierSearch, isFileGenerated, publishDate, closeDate } = args;

  const query = {
    $and: [await supplierFilter({}, supplierSearch)],
  };

  // status filter
  if (status) {
    query.status = status;
  }

  // date filter
  if (publishDate && closeDate) {
    const audits = await Audits.find({
      publishDate: { $gte: publishDate },
      closeDate: { $lte: closeDate },
    });

    const auditIds = audits.map(audit => audit._id);

    query.$and.push({ auditId: { $in: auditIds } });
  }

  // is file generated
  if (isFileGenerated) {
    query.$and.push({
      $or: [{ improvementPlanFile: { $ne: null } }, { reportFile: { $ne: null } }],
    });
  }

  return AuditResponses.find(query).sort({ sentDate: -1 });
};

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
  async auditResponses(root, args) {
    return responsesFilter(args);
  },

  /**
   * Count audit responses by qualified status's tabs
   * @param {Object} args - Query params
   * @return {Object} - Count map
   */
  async auditResponsesQualifiedStatus(root, args) {
    const responses = await responsesFilter(args);

    let coreHseqInfo = 0;
    let businessInfo = 0;
    let hrInfo = 0;

    // Check per section's all values are true
    const count = (name, schemaValue, count) => {
      if (AuditResponses.isSectionPassed({ name, schemaValue })) {
        count++;
      }

      return count;
    };

    for (const response of responses) {
      coreHseqInfo = count('coreHseqInfo', response.coreHseqInfo, coreHseqInfo);
      businessInfo = count('businessInfo', response.businessInfo, businessInfo);
      hrInfo = count('hrInfo', response.hrInfo, hrInfo);
    }

    return {
      coreHseqInfo,
      businessInfo,
      hrInfo,
    };
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
requireBuyer(auditQueries, 'auditResponsesQualifiedStatus');

requireSupplier(auditQueries, 'auditResponseByUser');

export default auditQueries;
