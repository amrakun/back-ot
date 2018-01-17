const basicInfoFields = `
  sotri: String
  sotie: String
`;

const evidenceInfoFields = `
  doesHaveHealthSafety: Boolean
  doesHaveDrugPolicy: Boolean
  doesPerformPreemployment: Boolean
  workProceduresConform: Boolean
  doesHaveFormalProcessForHSE: Boolean
  doesHaveSystemForTracking: Boolean
  doesHaveValidCertifications: Boolean
  doesHaveSystemForReporting: Boolean
  doesHaveLiabilityInsurance: Boolean
  doesHaveFormalProcessForHealth: Boolean
  isThereCurrentContract: Boolean
  doesHaveJobDescription: Boolean
  doesHaveTraining: Boolean
  doesHaveEmployeeRelatedProcedure: Boolean
  doesHaveTimeKeeping: Boolean
  doesHavePerformancePolicy: Boolean
  doesHaveProcessToSupport: Boolean
  employeesAwareOfRights: Boolean
  doesHaveSystemToEnsureSafeWork: Boolean
  doesHaveEmployeeSelectionProcedure: Boolean
  doesHaveEmployeeLaborProcedure: Boolean
  doesHaveGrievancePolicy: Boolean
  proccessToEnsurePolicesCompany: Boolean
  proccessToEnsurePolicesSupplyChain: Boolean
  hasBeenSubjectToInvestigation: Boolean
  doesHaveCorruptionPolicy: Boolean
  whoIsResponsibleForCorruptionPolicy: Boolean
`;

const generateCoreHseqFields = type => `
  doesHaveHealthSafety: ${type}
  doesHaveDocumentedPolicy: ${type}
  doesPerformPreemployment: ${type}
  doWorkProceduresConform: ${type}
  doesHaveTrackingSystem: ${type}
  doesHaveValidIndustry: ${type}
  doesHaveFormalProcessForReporting: ${type}
  doesHaveLiabilityInsurance: ${type}
  doesHaveFormalProcessForHealth: ${type}
`;

const generateHrFields = type => `
  workContractManagement: ${type}
  jobDescriptionProcedure: ${type}
  trainingDevelopment: ${type}
  employeePerformanceManagement: ${type}
  timeKeepingManagement: ${type}
  managementOfPractises: ${type}
  managementOfWorkforce: ${type}
  employeeAwareness: ${type}
  employeeSelection: ${type}
  employeeExitManagement: ${type}
  grievanceAndFairTreatment: ${type}
`;

const generateBusinessFields = type => `
  doesHavePolicyStatement: ${type}
  ensureThroughoutCompany: ${type}
  ensureThroughoutSupplyChain: ${type}
  haveBeenSubjectToInvestigation: ${type}
  doesHaveDocumentedPolicy: ${type}
  whoIsResponsibleForPolicy: ${type}
`;

export const types = `
  input Answer {
    supplierComment: String
    supplierAnswer: Boolean
  }

  input Recommendation {
    auditorComment: String
    auditorRecommendation: String
    auditorScore: Boolean
  }

  # supplier ======================

  # basic info
  input AuditSupplierBasicInfoInput {
    ${basicInfoFields}
  }

  # core hseq info
  input AuditSupplierCoreHseqInfoInput {
    ${generateCoreHseqFields('Answer')}
  }

  # hr info
  input AuditSupplierHrInfoInput {
    ${generateHrFields('Answer')}
  }

  # business info
  input AuditSupplierBusinessInfoInput {
    ${generateBusinessFields('Answer')}
  }

  # evidence info
  input AuditSupplierEvidenceInfoInput {
    ${evidenceInfoFields}
  }

  # buyer ======================
  # core hseq info
  input AuditBuyerCoreHseqInfoInput {
    ${generateCoreHseqFields('Recommendation')}
  }

  # hr info
  input AuditBuyerHrInfoInput {
    ${generateHrFields('Recommendation')}
  }

  # business info
  input AuditBuyerBusinessInfoInput {
    ${generateBusinessFields('Recommendation')}
  }

  type Audit {
    _id: String!
  }
`;

export const queries = ``;

export const mutations = `
  auditsSupplierSaveBasicInfo(
    auditId: String,
    supplierId: String,
    basicInfo: AuditSupplierBasicInfoInput
  ): Audit

  auditsSupplierSaveCoreHseqInfo(
    auditId: String,
    supplierId: String,
    coreHseqInfo: AuditSupplierCoreHseqInfoInput
  ): Audit

  auditsSupplierSaveHrInfo(
    auditId: String,
    supplierId: String,
    hrInfo: AuditSupplierHrInfoInput
  ): Audit

  auditsSupplierSaveBusinessInfo(
    auditId: String,
    supplierId: String,
    businessInfo: AuditSupplierBusinessInfoInput
  ): Audit

  auditsSupplierSaveEvidenceInfo(
    auditId: String,
    supplierId: String,
    evidenceInfo: AuditSupplierEvidenceInfoInput
  ): Audit

  auditsBuyerSaveCoreHseqInfo(
    auditId: String,
    supplierId: String,
    coreHseqInfo: AuditBuyerCoreHseqInfoInput
  ): Audit

  auditsBuyerSaveHrInfo(
    auditId: String,
    supplierId: String,
    hrInfo: AuditBuyerHrInfoInput
  ): Audit

  auditsBuyerSaveBusinessInfo(
    auditId: String,
    supplierId: String,
    businessInfo: AuditBuyerBusinessInfoInput
  ): Audit
`;
