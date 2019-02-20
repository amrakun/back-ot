const basicInfoFields = `
  enName: String!
  mnName: String
  isRegisteredOnSup: Boolean
  sapNumber: String
  address: String!
  address2: String
  address3: String
  townOrCity: String!
  province: String!
  zipCode: Int
  country: String!
  registeredInCountry: String!
  registeredInAimag: String
  registeredInSum: String
  isChinese: Boolean
  corporateStructure: String!
  registrationNumber: String
  certificateOfRegistration: JSON
  email: String
  website: String
  foreignOwnershipPercentage: String
  totalNumberOfEmployees: Int!
  totalNumberOfMongolianEmployees: Int!
  totalNumberOfUmnugoviEmployees: Int!
`;

const contactInfoFields = `
  name: String!
  jobTitle: String!
  address: String!
  address2: String
  address3: String
  townOrCity: String!
  province: String!
  zipCode: Int
  country: String!
  phone: Float!
  phone2: Float
  email: String!
`;

const personFields = `
  name: String
  jobTitle: String
  phone: Float
  email: String
`;

const shareholderFields = `
  name: String
  jobTitle: String
  percentage: Float
  attachments: [JSON]
`;

const factoryFields = `
  name: String
  townOrCity: String
  country: String
  productCodes: [String]
`;

const groupInfoFields = `
  hasParent: Boolean
  isParentExistingSup: Boolean
  parentName: String
  parentAddress: String
  parentRegistrationNumber: String
  role: [String!]!
  isExclusiveDistributor: Boolean
  authorizedDistributions: [String]
  attachments: [JSON]
  primaryManufacturerName: String
  countryOfPrimaryManufacturer: String
`;

const certificateInfoFields = `
  description: String
  file: JSON
`;

const yearAmountFields = `
  year: Int
  amount: Float
`;

const dateFileFields = `
  date: String
  file: JSON
`;

// exporting to use in qualification
export const financialInfoQualifiableFields = `
  canProvideAccountsInfo: Boolean
  currency: String
  isUpToDateSSP: Boolean
  isUpToDateCTP: Boolean
`;

const financialInfoNotQualifiableFields = `
  reasonToCannotNotProvide: String
`;

const investigationFields = `
  name: String!
  date: String!
  status: String!
  statusDate: String!
`;

// exporting to use in qualification
export const businessInfoQualifiableFields = `
  doesMeetMinimumStandarts: Boolean
  doesHaveJobDescription: Boolean
  doesConcludeValidContracts: Boolean
  employeeTurnoverRate: Float
  doesHaveLiabilityInsurance: Boolean
  doesHaveCodeEthics: Boolean
  doesHaveResponsiblityPolicy: Boolean
  hasConvictedLabourLaws: Boolean
  hasConvictedForHumanRights: Boolean
  hasConvictedForBusinessIntegrity: Boolean
  hasLeadersConvicted: Boolean
  doesEmployeePoliticallyExposed: Boolean
  organizationChartFile: JSON
  isSubContractor: Boolean
`;

const businessInfoNotQualifiableFields = `
  hasConvictedLabourLawsDescription: String
  hasConvictedForHumanRightsDescription: String
  proveHasNotConvicted: String
  doesMeetMinimumStandartsFile: JSON
  doesHaveJobDescriptionFile: JSON
  doesConcludeValidContractsFile: JSON
  doesHaveLiabilityInsuranceFile: JSON
  doesHaveCodeEthicsFile: JSON
  doesHaveResponsiblityPolicyFile: JSON
  pepName: String
`;

// exporting to use in qualification
export const environmentalInfoQualifiableFields = `
  doesHavePlan: Boolean
  hasEnvironmentalRegulatorInvestigated: Boolean
  hasConvictedForEnvironmentalLaws: Boolean
`;

const environmentalInfoNotQualifiableFields = `
  doesHavePlanFile: JSON
  dateOfInvestigation: String
  reasonForInvestigation: String
  actionStatus: String
  investigationDocumentation: JSON
  proveHasNotConvicted: String
`;

// exporting to use in qualification
export const healthInfoQualifiableFields = `
  doesHaveHealthSafety: Boolean
  areHSEResourcesClearlyIdentified: Boolean
  doesHaveDocumentedProcessToEnsure: Boolean
  areEmployeesUnderYourControl: Boolean
  doesHaveDocumentForRiskAssesment: Boolean
  doesHaveDocumentForIncidentInvestigation: Boolean
  doesHaveDocumentedFitness: Boolean
  isWillingToComply: Boolean
  hasIndustrialAccident: Boolean
  tmha: String
  ltifr: String
  injuryExplanation: String
  seniorManagement: String
  isWillingToCommit: Boolean
  isPerparedToCompile: Boolean
  hasWorkedOnWorldBank: Boolean
  hasWorkedOnLargeProjects: Boolean
  doesHaveLicense: Boolean
`;

const healthInfoNotQualifiableFields = `
  doesHaveHealthSafetyFile: JSON
  areHSEResourcesClearlyIdentifiedFile: JSON
  doesHaveDocumentedProcessToEnsureFile: JSON
  areEmployeesUnderYourControlFile: JSON
  doesHaveDocumentForRiskAssesmentFile: JSON
  doesHaveDocumentForIncidentInvestigationFile: JSON
  doesHaveDocumentedFitnessFile: JSON
  hasWorkedOnWorldBankDescription: String
  hasWorkedOnLargeProjectsDescription: String
  doesHaveLicenseDescription: String
`;

const difotScoreFields = `
  date: Date!
  amount: Float!
`;

export const types = `
  #  basic info ========================
  type CompanyBasicInfo { ${basicInfoFields.replace(/!/g, '')} }
  input CompanyBasicInfoInput { ${basicInfoFields} }

  #  contact info ======================
  type CompanyContactInfo { ${contactInfoFields} }
  input CompanyContactInfoInput { ${contactInfoFields} }


  # management team ==================
  type CompanyManagementTeamPerson { ${personFields} }
  input CompanyManagementTeamPersonInput { ${personFields} }

  type CompanyManagementTeamInfo {
    managingDirector: CompanyManagementTeamPerson
    executiveOfficer: CompanyManagementTeamPerson
    salesDirector: CompanyManagementTeamPerson
    financialDirector: CompanyManagementTeamPerson
    otherMember1: CompanyManagementTeamPerson
    otherMember2: CompanyManagementTeamPerson
    otherMember3: CompanyManagementTeamPerson
  }

  input CompanyManagementTeamInfoInput {
    managingDirector: CompanyManagementTeamPersonInput
    executiveOfficer: CompanyManagementTeamPersonInput
    salesDirector: CompanyManagementTeamPersonInput
    financialDirector: CompanyManagementTeamPersonInput
    otherMember1: CompanyManagementTeamPersonInput
    otherMember2: CompanyManagementTeamPersonInput
    otherMember3: CompanyManagementTeamPersonInput
  }

  #  shareholder =======================
  type CompanyShareholder { ${shareholderFields} }
  input CompanyShareholderInput { ${shareholderFields} }

  type CompanyShareholderInfo {
    attachments: [JSON]
    shareholders: [CompanyShareholder]
  }

  input CompanyShareholderInfoInput {
    attachments: [JSON]
    shareholders: [CompanyShareholderInput]
  }

  # group info =========================
  type CompanyFactory { ${factoryFields} }
  input CompanyFactoryInput { ${factoryFields} }

  type CompanyGroupInfo {
    ${groupInfoFields}
    factories: [CompanyFactory]
  }

  input CompanyGroupInfoInput {
    ${groupInfoFields}
    factories: [CompanyFactoryInput]
  }

  # certificate info ====================
  type CompanyCertificateInfo { ${certificateInfoFields} }
  input CompanyCertificateInfoInput { ${certificateInfoFields} }

  # financial info =====================
  type CompanyYearAmount { ${yearAmountFields} }
  input CompanyYearAmountInput { ${yearAmountFields} }

  type CompanyDateFile { ${dateFileFields} }
  input CompanyDateFileInput { ${dateFileFields} }

  type CompanyFinancialInfo {
    ${financialInfoQualifiableFields}
    ${financialInfoNotQualifiableFields}
    annualTurnover: [CompanyYearAmount]
    preTaxProfit: [CompanyYearAmount]
    totalAssets: [CompanyYearAmount]
    totalCurrentAssets: [CompanyYearAmount]
    totalShareholderEquity: [CompanyYearAmount]
    recordsInfo: [CompanyDateFile]
  }

  input CompanyFinancialInfoInput {
    ${financialInfoQualifiableFields}
    ${financialInfoNotQualifiableFields}
    annualTurnover: [CompanyYearAmountInput]
    preTaxProfit: [CompanyYearAmountInput]
    totalAssets: [CompanyYearAmountInput]
    totalCurrentAssets: [CompanyYearAmountInput]
    totalShareholderEquity: [CompanyYearAmountInput]
    recordsInfo: [CompanyDateFileInput]
  }

  # business and human resource ====
  type CompanyInvestigation { ${investigationFields} }
  input CompanyInvestigationtInput { ${investigationFields} }

  type CompanyBusinessInfo {
    ${businessInfoQualifiableFields}
    ${businessInfoNotQualifiableFields}
    investigations: [CompanyInvestigation]
  }

  input CompanyBusinessInfoInput {
    ${businessInfoQualifiableFields}
    ${businessInfoNotQualifiableFields}
    investigations: [CompanyInvestigationtInput]
  }

  # environmental management =============
  type CompanyEnvironmentalInfo {
    ${environmentalInfoQualifiableFields}
    ${environmentalInfoNotQualifiableFields}
  }
  input CompanyEnvironmentalInfoInput {
    ${environmentalInfoQualifiableFields}
    ${environmentalInfoNotQualifiableFields}
  }

   # health and safety management system  ==========
  type CompanyHealthInfo {
    ${healthInfoQualifiableFields}
    ${healthInfoNotQualifiableFields}
  }
  input CompanyHealthInfoInput {
    ${healthInfoQualifiableFields}
    ${healthInfoNotQualifiableFields}
  }

  type CompanyProductsInfoValidation {
    date: Date
    files: [JSON]
    checkedItems: [JSON]
    personName: String
    justification: String
  }

  type CompanyDifotScore { ${difotScoreFields} }
  input CompanyDifotScoreInput {
    supplierName: String!
    ${difotScoreFields}
  }

  type CompanyDueDiligence {
    date: Date
    expireDate: Date
    file: JSON
    createdUserId: String
    createdUser: User
  }

  input CompanyDueDiligenceInput {
    supplierId: String!
    file: JSON!
    expireDate: Date!
  }

  type Company {
    _id: String!
    basicInfo: CompanyBasicInfo
    contactInfo: CompanyContactInfo
    managementTeamInfo: CompanyManagementTeamInfo
    shareholderInfo: CompanyShareholderInfo
    groupInfo: CompanyGroupInfo

    tierType: String

    productsInfo: [String]
    validatedProductsInfo: [String]
    isProductsInfoValidated: Boolean

    certificateInfo: CompanyCertificateInfo
    financialInfo: CompanyFinancialInfo
    businessInfo: CompanyBusinessInfo
    environmentalInfo: CompanyEnvironmentalInfo
    healthInfo: CompanyHealthInfo

    isSentRegistrationInfo: Boolean

    isSentPrequalificationInfo: Boolean
    prequalificationSubmittedCount: Float
    isPrequalificationInfoEditable: Boolean

    isSkippedPrequalification: Boolean
    prequalificationSkippedReason: String

    isPrequalified: Boolean
    prequalifiedDate: Date
    prequalifiedStatus: JSON

    isQualified: Boolean

    averageDifotScore: Float

    productsInfoValidations: [CompanyProductsInfoValidation]
    difotScores: [CompanyDifotScore]
    dueDiligences: [CompanyDueDiligence]
    feedbacks: [Feedback]

    owner: User
    lastFeedback: Feedback
    lastProductsInfoValidation: JSON
    lastDifotScore: JSON
    lastDueDiligence: JSON

    tierTypeDisplay: String
    prequalificationStatusDisplay: String
    qualificationStatusDisplay: String
    productsInfoValidationStatusDisplay: String
    isBlocked: String
    openTendersCount: Int

    hasNewAudit: Boolean
    audits: [Audit]
    auditImprovementPlanNotification: AuditResponse
  }
`;

const queryParams = `
  page: Int,
  perPage: Int,
  search: String,
  region: String,
  productCodes: String,
  includeBlocked: Boolean,
  prequalifiedStatus: String,
  qualifiedStatus: String,
  productsInfoStatus: String,
  difotScore: String,
  region: String,
  sortField: String,
  sortDirection: Int,
  source: String,
  _ids: [String],
`;

export const queries = `
  companies(${queryParams}): [Company]
  companiesTotalCount(${queryParams}): Float
  companiesExport(${queryParams}): String
  companiesValidatedProductsInfoExport(${queryParams}): String
  companiesGenerateDifotScoreList(${queryParams}): String
  companiesGenerateDueDiligenceList(${queryParams}): String
  companiesGeneratePrequalificationList(${queryParams}): String

  companyDetail(_id: String!): Company
  companyByUser: Company
  companyRegistrationExport(_id: String!): String
  companyPrequalificationExport(_id: String!): String
  companyRegistrationSupplierExport: String
  companyPrequalificationSupplierExport: String

  companiesCountByTierType(
    startDate: Date!,
    endDate: Date!
  ): [JSON]

  companiesCountByRegisteredVsPrequalified(
    startDate: Date!
    endDate: Date!
    productCodes: String
  ): JSON

  companiesCountByProductCode(startDate: Date, endDate: Date): JSON

  companiesPrequalifiedStatus(${queryParams}): JSON
`;

export const mutations = `
  companiesEditBasicInfo(basicInfo: CompanyBasicInfoInput): Company
  companiesEditContactInfo(contactInfo: CompanyContactInfoInput): Company

  companiesEditManagementTeamInfo(
    managementTeamInfo: CompanyManagementTeamInfoInput
  ): Company

  companiesEditShareholderInfo(shareholderInfo: CompanyShareholderInfoInput): Company
  companiesEditGroupInfo(groupInfo: CompanyGroupInfoInput): Company
  companiesEditCertificateInfo(certificateInfo: CompanyCertificateInfoInput): Company
  companiesEditProductsInfo(productsInfo: [String]): Company
  companiesEditFinancialInfo(financialInfo: CompanyFinancialInfoInput): Company
  companiesEditBusinessInfo(businessInfo: CompanyBusinessInfoInput): Company

  companiesEditEnvironmentalInfo(
    environmentalInfo: CompanyEnvironmentalInfoInput
  ): Company

  companiesEditHealthInfo(healthInfo: CompanyHealthInfoInput): Company
  companiesAddDifotScores(difotScores: [CompanyDifotScoreInput]!): Company
  companiesAddDueDiligences(dueDiligences: [CompanyDueDiligenceInput]!): Company

  companiesValidateProductsInfo(
    _id: String!
    personName: String
    justification: String!
    checkedItems: [String!]!
    files: [JSON]
  ): Company

  companiesSendRegistrationInfo: Company
  companiesSendPrequalificationInfo: Company
  companiesSkipPrequalification(reason: String!): Company

  companiesTogglePrequalificationState(supplierId: String!): Company
`;
