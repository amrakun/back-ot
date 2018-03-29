import { Audits, AuditResponses, Companies } from '../../db/models';

export default {
  supplier(auditResponse) {
    return Companies.findOne({ _id: auditResponse.supplierId });
  },

  audit(auditResponse) {
    return Audits.findOne({ _id: auditResponse.auditId });
  },

  async qualifiedStatus(response) {
    return {
      coreHseqInfo: AuditResponses.isSectionPassed({
        name: 'coreHseqInfo',
        schemaValue: response.coreHseqInfo,
      }),

      businessInfo: AuditResponses.isSectionPassed({
        name: 'businessInfo',
        schemaValue: response.businessInfo,
      }),

      hrInfo: AuditResponses.isSectionPassed({
        name: 'hrInfo',
        schemaValue: response.hrInfo,
      }),
    };
  },
};
