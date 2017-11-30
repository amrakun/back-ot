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

export const types = `
  type CompanyBasicInfo { ${basicInfoFields} }
  input CompanyBasicInfoInput { ${basicInfoFields} }

  type CompanyContactInfo { ${contactInfoFields} }
  input CompanyContactInfoInput { ${contactInfoFields} }

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

  type Company {
    _id: String!
    basicInfo: CompanyBasicInfo,
    contactInfo: CompanyContactInfo,
    managementTeam: CompanyManagementTeam,
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
`;
