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
  registrationNumber: Float!
  certificateOfRegistration: JSON
  email: String!
  website: String
  foreignOwnershipPercentage: String!
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
  percentage: Int
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
  isReceived: Boolean
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
export const financialInfoFields = `
  canProvideAccountsInfo: Boolean
  reasonToCannotNotProvide: String
  currency: String
  isUpToDateSSP: Boolean
  isUpToDateCTP: Boolean
`;

const investigationFields = `
  name: String!
  date: String!
  status: String!
  statusDate: String!
`;

// exporting to use in qualification
export const businessInfoFields = `
  doesMeetMinimumStandarts: Boolean
  doesMeetMinimumStandartsFile: JSON

  doesHaveJobDescription: Boolean
  doesHaveJobDescriptionFile: JSON

  doesConcludeValidContracts: Boolean
  employeeTurnoverRate: Int

  doesHaveLiabilityInsurance: Boolean
  doesHaveLiabilityInsuranceFile: JSON

  doesHaveCodeEthics: Boolean
  doesHaveCodeEthicsFile: JSON

  doesHaveResponsiblityPolicy: Boolean
  doesHaveResponsiblityPolicyFile: JSON

  hasConvictedLabourLaws: Boolean
  hasConvictedForHumanRights: Boolean
  hasConvictedForBusinessIntegrity: Boolean
  proveHasNotConvicted: String
  hasLeadersConvicted: Boolean
  doesEmployeePoliticallyExposed: Boolean
  pepName: String

  organizationChartFile: JSON

  hasConvictedLabourLawsDescription: String
  hasConvictedForHumanRightsDescription: String

  isSubContractor: Boolean
`;

// exporting to use in qualification
export const environmentalInfoFields = `
  doesHavePlan: Boolean
  doesHavePlanFile: JSON
  hasEnvironmentalRegulatorInvestigated: Boolean
  dateOfInvestigation: String
  reasonForInvestigation: String
  actionStatus: String
  investigationDocumentation: JSON
  hasConvictedForEnvironmentalLaws: Boolean
  proveHasNotConvicted: String
`;

// exporting to use in qualification
export const healthInfoFields = `
  doesHaveHealthSafety: Boolean
  doesHaveHealthSafetyFile: JSON

  areHSEResourcesClearlyIdentified: Boolean
  areHSEResourcesClearlyIdentifiedFile: JSON

  doesHaveDocumentedProcessToEnsure: Boolean
  doesHaveDocumentedProcessToEnsureFile: JSON

  areEmployeesUnderYourControl: Boolean
  areEmployeesUnderYourControlFile: JSON

  doesHaveDocumentForRiskAssesment: Boolean
  doesHaveDocumentForRiskAssesmentFile: JSON

  doesHaveDocumentForIncidentInvestigation: Boolean
  doesHaveDocumentForIncidentInvestigationFile: JSON

  doesHaveDocumentedFitness: Boolean
  doesHaveDocumentedFitnessFile: JSON

  isWillingToComply: Boolean
  hasIndustrialAccident: Boolean
  tmha: String
  ltifr: String
  injuryExplanation: String
  seniorManagement: String
  isWillingToCommit: Boolean
  isPerparedToCompile: Boolean
  hasWorkedOnWorldBank: Boolean
  hasWorkedOnWorldBankDescription: String
  hasWorkedOnLargeProjects: Boolean
  hasWorkedOnLargeProjectsDescription: String
  doesHaveLicense: Boolean
  doesHaveLicenseDescription: String
`;

const difotScoreFields = `
  date: Date!
  amount: Float!
`;

export const types = `
  #  basic info ========================
  type CompanyBasicInfo { ${basicInfoFields} }
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
    ${financialInfoFields}
    annualTurnover: [CompanyYearAmount]
    preTaxProfit: [CompanyYearAmount]
    totalAssets: [CompanyYearAmount]
    totalCurrentAssets: [CompanyYearAmount]
    totalShareholderEquity: [CompanyYearAmount]
    recordsInfo: [CompanyDateFile]
  }

  input CompanyFinancialInfoInput {
    ${financialInfoFields}
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
    ${businessInfoFields}
    investigations: [CompanyInvestigation]
  }

  input CompanyBusinessInfoInput {
    ${businessInfoFields}
    investigations: [CompanyInvestigationtInput]
  }

  # environmental management =============
  type CompanyEnvironmentalInfo { ${environmentalInfoFields} }
  input CompanyEnvironmentalInfoInput { ${environmentalInfoFields} }

   # health and safety management system  ==========
  type CompanyHealthInfo { ${healthInfoFields} }
  input CompanyHealthInfoInput { ${healthInfoFields} }

  type CompanyDifotScore { ${difotScoreFields} }
  input CompanyDifotScoreInput {
    supplierName: String!
    ${difotScoreFields}
  }

  type CompanyDueDiligence {
    date: Date
    expireDate: Date
    file: JSON
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
    productsInfoLastValidatedDate: Date

    certificateInfo: CompanyCertificateInfo
    financialInfo: CompanyFinancialInfo
    businessInfo: CompanyBusinessInfo
    environmentalInfo: CompanyEnvironmentalInfo
    healthInfo: CompanyHealthInfo

    isSentRegistrationInfo: Boolean
    isSentPrequalificationInfo: Boolean

    isPrequalified: Boolean
    isQualified: Boolean

    averageDifotScore: Float
    difotScores: [CompanyDifotScore]

    dueDiligences: [CompanyDueDiligence]

    feedbacks: [Feedback]
    lastFeedback: Feedback

    lastDifotScore: JSON
    lastDueDiligence: JSON

    isBlocked: Boolean
    openTendersCount: Int

    audits: [Audit]
  }
`;

const queryParams = `
  page: Int,
  perPage: Int,
  search: String,
  region: String,
  productCodes: String,
  isProductsInfoValidated: Boolean,
  includeBlocked: Boolean,
  isPrequalified: Boolean,
  isQualified: Boolean,
  difotScore: String,
  region: String,
  sortField: String,
  sortDirection: Int,
  _ids: [String],
`;

export const queries = `
  companies(${queryParams}): [Company]
  companiesExport(${queryParams}): String
  companiesValidatedProductsInfoExport(${queryParams}): String
  companiesGenerateDifotScoreList(${queryParams}): String
  companiesGenerateDueDiligenceList(${queryParams}): String

  companyDetail(_id: String!): Company
  companyByUser: Company
  companyDetailExport(_id: String!): String

  companiesCountByTierType(
    startDate: Date!,
    endDate: Date!
  ): [JSON]

  companiesCountByRegisteredVsPrequalified(
    startDate: Date!,
    endDate: Date!
    productCodes: String
  ): JSON
`;

export const mutations = `
  companiesEditBasicInfo(basicInfo: CompanyBasicInfoInput): Company
  companiesEditContactInfo(contactInfo: CompanyContactInfoInput): Company
  companiesEditManagementTeamInfo(managementTeamInfo: CompanyManagementTeamInfoInput): Company
  companiesEditShareholderInfo(shareholderInfo: CompanyShareholderInfoInput): Company
  companiesEditGroupInfo(groupInfo: CompanyGroupInfoInput): Company
  companiesEditCertificateInfo(certificateInfo: CompanyCertificateInfoInput): Company
  companiesEditProductsInfo(productsInfo: [String]): Company
  companiesEditFinancialInfo(financialInfo: CompanyFinancialInfoInput): Company
  companiesEditBusinessInfo(businessInfo: CompanyBusinessInfoInput): Company
  companiesEditEnvironmentalInfo(environmentalInfo: CompanyEnvironmentalInfoInput): Company
  companiesEditHealthInfo(healthInfo: CompanyHealthInfoInput): Company

  companiesAddDifotScores(difotScores: [CompanyDifotScoreInput]!): Company
  companiesAddDueDiligences(dueDiligences: [CompanyDueDiligenceInput]!): Company
  companiesValidateProductsInfo(_id: String!, codes: [String]!): Company

  companiesSendRegistrationInfo: Company
  companiesSendPrequalificationInfo: Company
  companiesUndoIsSentPrequalificationInfo(supplierId: String!): Company
`;
