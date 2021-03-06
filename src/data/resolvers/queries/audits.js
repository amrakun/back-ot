import { Companies, Audits, AuditResponses } from '../../../db/models';
import { requireBuyer, requireSupplier } from '../../permissions';
import { supplierFilter } from './utils';

/*
 * Common audit responses filter
 */
export const responsesFilter = async args => {
  const { supplierSearch, publishDate, closeDate, qualStatus, supplierStatus } = args;

  const query = {
    $and: [await supplierFilter({}, supplierSearch)],
  };

  if (qualStatus) {
    const audits = await Audits.find({ status: qualStatus }, { _id: 1 });
    query.auditId = { $in: audits.map(a => a._id) };
  }

  if (supplierStatus) {
    query.status = supplierStatus;
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
   * Will give all invited, not responded suppliers information for
   * all audits
   */
  async auditsSuppliers(root, { type }) {
    const audits = await Audits.find({});

    const response = [];

    for (const audit of audits) {
      let suppliers = await Companies.find({ _id: { $in: audit.supplierIds } });

      if (type === 'notResponded') {
        const auditResponses = await AuditResponses.find({ auditId: audit._id });

        // responded supplier ids
        const rsids = auditResponses.map(r => r.supplierId);

        // not responded supplier ids
        const nrsids = audit.supplierIds.filter(id => !rsids.includes(id));

        suppliers = await Companies.find({ _id: { $in: nrsids } });
      }

      for (const supplier of suppliers) {
        response.push({ audit, supplier });
      }
    }

    return response;
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
    let notNotified = 0;

    for (const audit of audits) {
      const supplierIds = audit.supplierIds || [];

      invited += supplierIds.length;

      const responses = await AuditResponses.find({ isSent: true, auditId: audit._id });

      notResponded += supplierIds.length - responses.length;

      qualified += responses.filter(r => r.isQualified).length;
      sentImprovementPlan += responses.filter(r => r.improvementPlanSentDate).length;
      notNotified += responses.filter(r => r.notificationForBuyer).length;
    }

    return {
      invited,
      notResponded,
      qualified,
      sentImprovementPlan,
      notNotified,
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
  async auditResponseByUser(root, { auditId }, { user }) {
    const audit = await Audits.findOne({ _id: auditId });

    if (audit && !audit.supplierIds.includes(user.companyId)) {
      throw new Error('Not found');
    }

    return AuditResponses.findOne({ auditId, supplierId: user.companyId });
  },
};

requireBuyer(auditQueries, 'audits');
requireBuyer(auditQueries, 'auditsSuppliers');
requireBuyer(auditQueries, 'auditDetail');
requireBuyer(auditQueries, 'auditResponses');
requireBuyer(auditQueries, 'auditResponseDetail');
requireBuyer(auditQueries, 'auditResponsesQualifiedStatus');
requireBuyer(auditQueries, 'auditResponseTotalCounts');

requireSupplier(auditQueries, 'auditResponseByUser');

export default auditQueries;
