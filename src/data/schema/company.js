const basicInfoFields = `
  enName: String!,
  mnName: String!,
  isRegisteredOnSup: Boolean,
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
  isSubContractor: Boolean,
  corporateStructure: String!,
  registrationNumber: Int!,
  email: String!,
  foreignOwnershipPercentage: Int!,
  totalIntOfEmployees: Int!,
  totalIntOfMongolianEmployees: Int!,
  totalIntOfUmnugoviEmployees: Int!,
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
  name: String!,
  jobTitle: String!,
  phone: Float!,
  email: String!,
`;

const shareholderFields = `
  name: String!,
  jobTitle: String!,
  percentage: Int!,
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
  year: Int!,
  amount: Float!,
`;

const datePathFields = `
  date: String!,
  path: String!,
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

const businessAndHumanResourceFields = `
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

const enviromentalManagementFields = `
  doesHaveEnviromentalManagementPlan: Boolean,
  hasEnviromentalRegulatorInvestigated: Boolean,
  dateOfInvestigation: String!,
  reasonForInvestigation: String!,
  actionStatus: String!,
  investigationDocumentation: String!,
  hasConvictedForEnvironmentalLaws: Boolean,
  proveHasNotConvicted: String!,
  additionalInformation: String!,
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

  type CompanyManagementTeam {
    managingDirector: CompanyManagementTeamPerson,
    executiveOfficer: CompanyManagementTeamPerson,
    salesDirector: CompanyManagementTeamPerson,
    financialDirector: CompanyManagementTeamPerson,
    otherMember1: CompanyManagementTeamPerson,
    otherMember2: CompanyManagementTeamPerson,
    otherMember3: CompanyManagementTeamPerson,
  }

  input CompanyManagementTeamInput {
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

  type CompanyShareholders {
    attachments: [String],
    shareholder1: CompanyShareholder,
    shareholder2: CompanyShareholder,
    shareholder3: CompanyShareholder,
    shareholder4: CompanyShareholder,
    shareholder5: CompanyShareholder,
  }

  input CompanyShareholdersInput {
    attachments: [String],
    shareholder1: CompanyShareholderInput,
    shareholder2: CompanyShareholderInput,
    shareholder3: CompanyShareholderInput,
    shareholder4: CompanyShareholderInput,
    shareholder5: CompanyShareholderInput,
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
    canProvideRecordsInfo: [CompanyDatePath]
  }

  input CompanyFinancialInfoInput {
    ${financialInfoFields}
    annualTurnover: [CompanyYearAmountInput]
    preTaxProfit: [CompanyYearAmountInput]
    totalAssets: [CompanyYearAmountInput]
    totalCurrentAssets: [CompanyYearAmountInput]
    totalShareholderEquity: [CompanyYearAmountInput]
    canProvideRecordsInfo: [CompanyDatePathInput]
  }

  # business and human resource ====
  type CompanyInvestigation { ${investigationFields} }
  input CompanyInvestigationtInput { ${investigationFields} }

  type CompanyBusinessAndHumanResource {
    ${businessAndHumanResourceFields}
    investigations: [CompanyInvestigation]
  }

  input CompanyBusinessAndHumanResourceInput {
    ${businessAndHumanResourceFields}
    investigations: [CompanyInvestigationtInput]
  }

  # enviromental management =============
  type CompanyEnviromentalManagement { ${enviromentalManagementFields} }
  input CompanyEnviromentalManagementInput { ${enviromentalManagementFields} }

  type Company {
    _id: String!
    basicInfo: CompanyBasicInfo,
    contactInfo: CompanyContactInfo,
    managementTeam: CompanyManagementTeam,
    shareholderInfo: CompanyShareholders,
    groupInfo: CompanyGroupInfo,
    products: [String],
    certificateInfo: CompanyCertificateInfo,
    financialInfo: CompanyFinancialInfo,
    businessAndHumanResource: CompanyBusinessAndHumanResource,
    enviromentalManagement: CompanyEnviromentalManagement,
  }
`;

export const queries = `
  companies(page: Int, perPage: Int): [Company]
  companyDetail(_id: String!): Company
`;

export const mutations = `
  companiesAdd(basicInfo: CompanyBasicInfoInput): Company
  companiesEditBasicInfo(_id: String!, basicInfo: CompanyBasicInfoInput): Company
  companiesEditContactInfo(_id: String!, contactInfo: CompanyContactInfoInput): Company
  companiesEditManagementTeam(_id: String!, managementTeam: CompanyManagementTeamInput): Company
  companiesEditShareholders(_id: String!, shareholders: CompanyShareholdersInput): Company
  companiesEditGroupInfo(_id: String!, groupInfo: CompanyGroupInfoInput): Company
  companiesEditCertificateInfo(_id: String!, certificateInfo: CompanyCertificateInfoInput): Company
  companiesEditProductsInfo(_id: String!, productsInfo: [String]): Company
  companiesEditFinancialInfo(_id: String!, financialInfo: CompanyFinancialInfoInput): Company
  companiesEditBusinessAndHumanResource(_id: String!, businessAndHumanResource: CompanyBusinessAndHumanResourceInput): Company
  companiesEditEnviromentalManagement(_id: String!, enviromentalManagement: CompanyEnviromentalManagementInput): Company
`;
