import { Users, Companies, AuditResponses } from '../../db/models';

export default {
  createdUser(audit) {
    return Users.findOne({ _id: audit.createdUserId });
  },

  suppliers(audit) {
    return Companies.find({ _id: { $in: audit.supplierIds } });
  },

  responses(audit) {
    return AuditResponses.find({ auditId: audit._id, isSent: true });
  },

  supplierResponse(audit, args, { user }) {
    return AuditResponses.findOne({ auditId: audit._id, supplierId: user.companyId });
  },
};
