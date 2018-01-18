import { Audits, AuditResponses } from '../../../db/models';
import { requireBuyer, requireSupplier } from '../../permissions';

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
requireBuyer(auditQueries, 'auditResponseDetail');

requireSupplier(auditQueries, 'auditResponseByUser');

export default auditQueries;
