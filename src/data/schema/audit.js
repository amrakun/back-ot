const basicInfoFields = `
  sotri: String
  sotie: String
  otExperience: String
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
  doesHaveFormalProcess: ${type}
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
  doesHaveDocumentedPolicyToCorruption: ${type}
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

  input HrAnswer {
    supplierComment: String
    supplierAnswer: Int
  }

  input HrRecommendation {
    auditorComment: String
    auditorRecommendation: String
    auditorScore: Int
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
    ${generateHrFields('HrAnswer')}
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
    ${generateHrFields('HrRecommendation')}
  }

  # business info
  input AuditBuyerBusinessInfoInput {
    ${generateBusinessFields('Recommendation')}
  }

  # types ==================

  type AnswerRecommendation {
    supplierComment: String
    supplierAnswer: Boolean
    auditorComment: String
    auditorRecommendation: String
    auditorScore: Boolean
  }

  type HrAnswerRecommendation {
    supplierComment: String
    supplierAnswer: Int
    auditorComment: String
    auditorRecommendation: String
    auditorScore: Int
  }

  type AuditBasicInfo {
    ${basicInfoFields}
  }

  type AuditCoreHseqInfo {
    ${generateCoreHseqFields('AnswerRecommendation')}
  }

  type AuditHrInfo {
    ${generateHrFields('HrAnswerRecommendation')}
  }

  type AuditBusinessInfo {
    ${generateBusinessFields('AnswerRecommendation')}
  }

  type AuditEvidenceInfo {
    ${evidenceInfoFields}
  }

  type Audit {
    _id: String!
    createdUserId: String
    supplierIds: [String]
    status: String
    publishDate: Date
    closeDate: Date

    createdUser: User
    suppliers: [Company]
    supplierResponse: AuditResponse
    responses: [AuditResponse]
  }

  type AuditResponse {
    _id: String!
    auditId: String
    supplierId: String

    status: String

    basicInfo: AuditBasicInfo
    coreHseqInfo: AuditCoreHseqInfo
    hrInfo: AuditHrInfo
    businessInfo: AuditBusinessInfo
    evidenceInfo: AuditEvidenceInfo

    isSent: Boolean
    submittedCount: Float
    isEditable: Boolean
    isBuyerNotified: Boolean
    isSupplierNotified: Boolean

    isQualified: Boolean
    qualifiedStatus: JSON

    improvementPlanFile: String
    improvementPlanSentDate: Date
    reportFile: String
    reportSentDate: Date


    supplier: Company
    audit: Audit
  }

  type AuditResponseTotalCounts {
    invited: Float
    notResponded: Float
    qualified: Float
    sentImprovementPlan: Float
    notNotified: Float
  }

  type AuditSuppliersResponse {
    audit: Audit
    supplier: Company
  }
`;

const responsesParams = `
  supplierSearch: String
  isFileGenerated: Boolean
  publishDate: Date
  closeDate: Date
  status: String
  isQualified: Boolean
  isNew: Boolean
  isSentImprovementPlan: Boolean
`;

export const queries = `
  audits: [Audit]
  auditsSuppliers(type: String!): [AuditSuppliersResponse]
  auditDetail(_id: String!): Audit

  auditResponses(${responsesParams}): [AuditResponse]

  auditResponseTotalCounts: AuditResponseTotalCounts

  auditResponsesQualifiedStatus(${responsesParams}): JSON

  auditResponseDetail(auditId: String!, supplierId: String!): AuditResponse
  auditResponseByUser(auditId: String!): AuditResponse

  auditImprovementPlan(
    auditId: String!,
    supplierId: String!
    auditDate: Date!,
    auditResult: Boolean!,
    reassessmentDate: Date!,
    auditorName: String!
  ): String

  auditReport(
    auditId: String!,
    supplierId: String!
    auditDate: Date!,
    auditResult: Boolean!,
    auditor: String!,
    reportNo: String!
  ): String
`;

export const mutations = `
  auditsAdd(publishDate: Date!, closeDate: Date!, supplierIds: [String]!): Audit

  auditsSupplierSaveBasicInfo(
    auditId: String,
    basicInfo: AuditSupplierBasicInfoInput
  ): Audit

  auditsSupplierSaveCoreHseqInfo(
    auditId: String,
    coreHseqInfo: AuditSupplierCoreHseqInfoInput
  ): Audit

  auditsSupplierSaveHrInfo(
    auditId: String,
    hrInfo: AuditSupplierHrInfoInput
  ): Audit

  auditsSupplierSaveBusinessInfo(
    auditId: String,
    businessInfo: AuditSupplierBusinessInfoInput
  ): Audit

  auditsSupplierSaveEvidenceInfo(
    auditId: String,
    evidenceInfo: AuditSupplierEvidenceInfoInput
  ): Audit

  auditsSupplierSendResponse(auditId: String): AuditResponse

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

  auditsBuyerSaveFiles(
    auditId: String!,
    supplierId: String!,
    improvementPlan: String,
    report: String,
  ): AuditResponse

  auditsBuyerSendFiles(
    responseIds: [String]!,
    improvementPlan: Boolean,
    report: Boolean,
  ): [AuditResponse]
`;
