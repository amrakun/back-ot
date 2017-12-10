const basicInfoFields = `
  enName: String!,
  mnName: String!,
  isRegisteredOnSup: Boolean,
  sapNumber: String!,
  address: String!,
  address2: String,
  address3: String,
  townOrCity: String!,
  province: String!,
  zipCode: Int!,
  country: String!,
  registeredInCountry: String!,
  registeredInAimag: String!,
  registeredInSum: String!,
  isChinese: Boolean,
  isSubContractor: Boolean,
  corporateStructure: String!,
  registrationNumber: Int!,
  certificateOfRegistration: String!,
  email: String!,
  website: String!,
  foreignOwnershipPercentage: String!,
  totalNumberOfEmployees: Int!,
  totalNumberOfMongolianEmployees: Int!,
  totalNumberOfUmnugoviEmployees: Int!,
`;

const contactInfoFields = `
  name: String!,
  jobTitle: String!,
  address: String!,
  address2: String,
  address3: String,
  townOrCity: String!,
  province: String!,
  zipCode: Int!,
  country: String!,
  phone: Float!,
  phone2: Float,
  email: String!,
`;

const personFields = `
  name: String,
  jobTitle: String,
  phone: Float,
  email: String,
`;

const shareholderFields = `
  name: String,
  jobTitle: String,
  percentage: Int,
`;

const groupInfoFields = `
  hasParent: Boolean,
  role: String!,
  isExclusiveDistributor: Boolean,
  attachments: [String],
  primaryManufacturerName: String!,
  countryOfPrimaryManufacturer: String!,
`;

const certificateInfoFields = `
  isReceived: Boolean,
  isOTSupplier: Boolean,
  cwpo: String!,
`;

const yearAmountFields = `
  year: Int,
  amount: Float,
`;

const datePathFields = `
  date: String,
  path: String,
`;

const financialInfoFields = `
  canProvideAccountsInfo: Boolean,
  currency: String!,
  isUpToDateSSP: Boolean,
  isUpToDateCTP: Boolean,
`;
const investigationFields = `
  name: String!,
  date: String!,
  status: String!,
  statusDate: String!,
`;

const businessInfoFields = `
  doesMeetMinimumStandarts: Boolean,
  doesHaveJobDescription: Boolean,
  doesConcludeValidContracts: Boolean,
  employeeTurnoverRate: Int,
  doesHaveLiabilityInsurance: Boolean,
  doesHaveCodeEthics: Boolean,
  doesHaveResponsiblityPolicy: Boolean,
  hasConvictedLabourLaws: Boolean,
  hasConvictedForHumanRights: Boolean,
  hasConvictedForBusinessIntegrity: Boolean,
  proveHasNotConvicted: String!,
  hasLeadersConvicted: Boolean,
  doesEmployeePoliticallyExposed: Boolean,
  additionalInformation: String!,
`;

const environmentalInfoFields = `
  doesHavePlan: Boolean,
  hasEnvironmentalRegulatorInvestigated: Boolean,
  dateOfInvestigation: String!,
  reasonForInvestigation: String!,
  actionStatus: String!,
  investigationDocumentation: String!,
  hasConvictedForEnvironmentalLaws: Boolean,
  proveHasNotConvicted: String!,
  additionalInformation: String!,
`;
const healthInfoFields = `
  doesHaveHealthSafety: Boolean,
  areHSEResourcesClearlyIdentified: Boolean,
  doesHaveDocumentedProcessToEnsure: Boolean,
  areEmployeesUnderYourControl: Boolean,
  doesHaveDocumentForRiskAssesment: Boolean,
  doesHaveDocumentForIncidentInvestigation: Boolean,
  doesHaveDocumentedFitness: Boolean,
  isWillingToComply: Boolean,
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
    managingDirector: CompanyManagementTeamPerson,
    executiveOfficer: CompanyManagementTeamPerson,
    salesDirector: CompanyManagementTeamPerson,
    financialDirector: CompanyManagementTeamPerson,
    otherMember1: CompanyManagementTeamPerson,
    otherMember2: CompanyManagementTeamPerson,
    otherMember3: CompanyManagementTeamPerson,
  }

  input CompanyManagementTeamInfoInput {
    managingDirector: CompanyManagementTeamPersonInput,
    executiveOfficer: CompanyManagementTeamPersonInput,
    salesDirector: CompanyManagementTeamPersonInput,
    financialDirector: CompanyManagementTeamPersonInput,
    otherMember1: CompanyManagementTeamPersonInput,
    otherMember2: CompanyManagementTeamPersonInput,
    otherMember3: CompanyManagementTeamPersonInput,
  }

  #  shareholder =======================
  type CompanyShareholder { ${shareholderFields} }
  input CompanyShareholderInput { ${shareholderFields} }

  type CompanyShareholderInfo {
    attachments: [String],
    shareholders: [CompanyShareholder],
  }

  input CompanyShareholderInfoInput {
    attachments: [String],
    shareholders: [CompanyShareholderInput],
  }

  # group info =========================
  type CompanyGroupInfo {
    ${groupInfoFields}
    shareholders: [CompanyShareholder]
  }

  input CompanyGroupInfoInput {
    ${groupInfoFields}
    shareholders: [CompanyShareholderInput]
  }

  # certificate info ====================
  type CompanyCertificateInfo { ${certificateInfoFields} }
  input CompanyCertificateInfoInput { ${certificateInfoFields} }

  # financial info =====================
  type CompanyYearAmount { ${yearAmountFields} }
  input CompanyYearAmountInput { ${yearAmountFields} }

  type CompanyDatePath { ${datePathFields} }
  input CompanyDatePathInput { ${datePathFields} }

  type CompanyFinancialInfo {
    ${financialInfoFields}
    annualTurnover: [CompanyYearAmount]
    preTaxProfit: [CompanyYearAmount]
    totalAssets: [CompanyYearAmount]
    totalCurrentAssets: [CompanyYearAmount]
    totalShareholderEquity: [CompanyYearAmount]
    recordsInfo: [CompanyDatePath]
  }

  input CompanyFinancialInfoInput {
    ${financialInfoFields}
    annualTurnover: [CompanyYearAmountInput]
    preTaxProfit: [CompanyYearAmountInput]
    totalAssets: [CompanyYearAmountInput]
    totalCurrentAssets: [CompanyYearAmountInput]
    totalShareholderEquity: [CompanyYearAmountInput]
    recordsInfo: [CompanyDatePathInput]
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

  type Company {
    _id: String!
    basicInfo: CompanyBasicInfo,
    contactInfo: CompanyContactInfo,
    managementTeamInfo: CompanyManagementTeamInfo,
    shareholderInfo: CompanyShareholderInfo,
    groupInfo: CompanyGroupInfo,
    productsInfo: [String],
    certificateInfo: CompanyCertificateInfo,
    financialInfo: CompanyFinancialInfo,
    businessInfo: CompanyBusinessInfo,
    environmentalInfo: CompanyEnvironmentalInfo,
    healthInfo: CompanyHealthInfo,
  }
`;

export const queries = `
  companies(page: Int, perPage: Int): [Company]
  companyDetail(_id: String!): Company
`;

export const mutations = `
  companiesEditBasicInfo(_id: String!, basicInfo: CompanyBasicInfoInput): Company
  companiesEditContactInfo(_id: String!, contactInfo: CompanyContactInfoInput): Company

  companiesEditManagementTeamInfo(
    _id: String!,
    managementTeamInfo: CompanyManagementTeamInfoInput
  ): Company

  companiesEditShareholderInfo(_id: String!, shareholderInfo: CompanyShareholderInfoInput): Company
  companiesEditGroupInfo(_id: String!, groupInfo: CompanyGroupInfoInput): Company
  companiesEditCertificateInfo(_id: String!, certificateInfo: CompanyCertificateInfoInput): Company
  companiesEditProductsInfo(_id: String!, productsInfo: [String]): Company
  companiesEditFinancialInfo(_id: String!, financialInfo: CompanyFinancialInfoInput): Company
  companiesEditBusinessInfo(_id: String!, businessInfo: CompanyBusinessInfoInput): Company

  companiesEditEnvironmentalInfo(
    _id: String!,
    environmentalInfo: CompanyEnvironmentalInfoInput
  ): Company

  companiesEditHealthInfo(_id: String!, healthInfo: CompanyHealthInfoInput): Company
`;
