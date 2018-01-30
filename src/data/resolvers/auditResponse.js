import { Audits, Companies } from '../../db/models';

export default {
  supplier(auditResponse) {
    return Companies.findOne({ _id: auditResponse.supplierId });
  },

  audit(auditResponse) {
    return Audits.findOne({ _id: auditResponse.auditId });
  },
};
