export const types = `
  type ReportsSupplier {
    _id: String!
    isRegisteredOnSup: Boolean!
    enName: String!
    mnName: String!
    isPrequalified: Boolean!
    averageDifotScore: Int
    isProductsInfoValidated: Boolean!
    address: String!
    address2: String!
    address3: String!
    townOrCity: String!
    country: String!
    province: String!
    registeredInCountry: String!
    registeredInAimag: String!
    registeredInSum: String!
    isChinese: Boolean!
    registrationNumber: Int!
    certificateOfRegistration: Boolean!
    website: String!
    email: String!
    phone: String!
    foreignOwnershipPercentage: String!
    totalNumberOfEmployees: Int!
    totalNumberOfMongolianEmployees: Int!
    totalNumberOfUmnugoviEmployees: Int!
  }

  enum ReportsTendersType {
    rfq
    eoi
  }
`;

export const queries = `
  reportsSuppliers(
    productCode: [String],
    isPrequalified: Boolean,
  ): [ReportsSupplier]

  reportsSuppliersExport(
    productCode: [String],
    isPrequalified: Boolean,
  ): String

  reportsTenders(
    type: ReportsTendersType,
    publishDate: Date,
    closeDate: Date,
  ): [Tender]
`;
