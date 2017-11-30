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

export const types = `
  type CompanyBasicInfo {
    ${basicInfoFields}
  }

  input CompanyBasicInfoInput {
    ${basicInfoFields}
  }

  type Company {
    _id: String!
    basicInfo: CompanyBasicInfo,
  }
`;

export const queries = `
  companies(page: Int, perPage: Int): [Company]
  companyDetail(_id: String!): Company
`;

export const mutations = `
  companiesAdd(basicInfo: CompanyBasicInfoInput): Company
  companiesEditBasicInfo(_id: String!, basicInfo: CompanyBasicInfoInput): Company
`;
