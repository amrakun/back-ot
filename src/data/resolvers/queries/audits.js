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
