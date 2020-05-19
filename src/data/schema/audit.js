const basicInfoFields = `
  sotri: String
  sotie: String
  otExperience: String
  sotieFile: JSON
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
  specialLicenseOfImporting: ${type}
  wasteManagementPlan: ${type}
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
    supplierFile: JSON
  }

  input Recommendation {
    auditorComment: String
    auditorRecommendation: String
    auditorScore: Boolean
  }

  input HrAnswer {
    supplierComment: String
    supplierAnswer: Int
    supplierFile: JSON
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
    supplierFile: JSON

    auditorComment: String
    auditorRecommendation: String
    auditorScore: Boolean
  }

  type HrAnswerRecommendation {
    supplierComment: String
    supplierAnswer: Int
    supplierFile: JSON

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

  type AuditResultForm {
    reportLanguage: String,
    auditDate: Date,
    reassessmentDate: Date,
    reportNo: String,
    auditor: String,
    content: String,
    reminderDay: Float,
  }

  type Audit {
    _id: String!
    createdUserId: String
    status: String

    supplierIds: [String]
    publishDate: Date
    closeDate: Date
    responsibleBuyerIds: [String]
    content: String

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
    auditStatus: String

    basicInfo: AuditBasicInfo
    coreHseqInfo: AuditCoreHseqInfo
    hrInfo: AuditHrInfo
    businessInfo: AuditBusinessInfo
    resultForm: AuditResultForm

    isSent: Boolean
    sentDate: Date
    submittedCount: Float
    isEditable: Boolean
    editableDate: Date
    notificationForBuyer: String

    isQualified: Boolean
    qualifiedStatus: JSON

    improvementPlanFile: String
    improvementPlanSentDate: Date
    reportFile: String
    reportSentDate: Date

    isSentResubmitRequest: Boolean

    qualificationStatusDisplay: String
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
  publishDate: Date
  closeDate: Date
  qualStatus: String
  supplierStatus: String
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
    auditor: String!
  ): String

  auditReport(
    auditId: String!,
    supplierId: String!
    auditDate: Date!,
    auditResult: Boolean!,
    auditor: String!,
    reportNo: String!
    reportLanguage: String
  ): String

  auditExportResponses: String
`;

export const mutations = `
  auditsAdd(
    publishDate: Date!,
    closeDate: Date!,
    supplierIds: [String]!
    responsibleBuyerIds: [String],
    content: String!,
    reminderDay: Float
  ): Audit

  auditsSupplierSaveBasicInfo(
    auditId: String,
    basicInfo: AuditSupplierBasicInfoInput
  ): AuditResponse

  auditsSupplierSaveCoreHseqInfo(
    auditId: String,
    coreHseqInfo: AuditSupplierCoreHseqInfoInput
  ): AuditResponse

  auditsSupplierSaveHrInfo(
    auditId: String,
    hrInfo: AuditSupplierHrInfoInput
  ): AuditResponse

  auditsSupplierSaveBusinessInfo(
    auditId: String,
    businessInfo: AuditSupplierBusinessInfoInput
  ): AuditResponse

  auditsSupplierSendResponse(auditId: String): AuditResponse

  auditsSupplierSendResubmitRequest(description: String!): String

  auditsBuyerSaveCoreHseqInfo(
    auditId: String,
    supplierId: String,
    coreHseqInfo: AuditBuyerCoreHseqInfoInput
  ): AuditResponse

  auditsBuyerSaveHrInfo(
    auditId: String,
    supplierId: String,
    hrInfo: AuditBuyerHrInfoInput
  ): AuditResponse

  auditsBuyerSaveBusinessInfo(
    auditId: String,
    supplierId: String,
    businessInfo: AuditBuyerBusinessInfoInput
  ): AuditResponse

  auditsBuyerSendFiles(
    responseIds: [String]!,
    reassessmentDate: Date,
    reminderDay: Float,
    improvementPlan: Boolean,
    report: Boolean,
  ): [AuditResponse]

  auditsBuyerCancelResponse(responseId: String!): JSON
  auditsBuyerNotificationMarkAsRead(responseId: String!): JSON

  auditsBuyerToggleState(supplierId: String!, editableDate: Date): AuditResponse

  auditsBuyerSaveResultForm(
    responseId: String!
    reportLanguage: String,
    auditDate: Date,
    reassessmentDate: Date,
    reportNo: String,
    auditor: String,
    content: String,
    reminderDay: Float
  ): AuditResponse
`;
