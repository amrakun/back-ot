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

export const types = `
  type CompanyBasicInfo {
    ${basicInfoFields}
  }

  input CompanyBasicInfoInput {
    ${basicInfoFields}
  }

  type CompanyContactInfo {
    ${contactInfoFields}
  }

  input CompanyContactInfoInput {
    ${contactInfoFields}
  }

  type Company {
    _id: String!
    basicInfo: CompanyBasicInfo,
    contactInfo: CompanyContactInfo,
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
`;
