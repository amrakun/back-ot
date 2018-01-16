export const types = `
  input ReportsSuppliersFilterDateInterval {
    startDate: Date
    endDate: Date
  }

  input ReportsSuppliersFilterAffiliation {
    country: String
    province: String
  }

  enum ReportsSuppliersFilterStatus {
    preQualified
    validate
  }

  type ReportsSuppliersDifotScore {
    date: Date,
    amount: Int
  }

  type ReportsSupplier {
    _id: String!
    isRegisteredOnSup: Boolean!
    enName: String!
    mnName: String!
    isPrequalified: Boolean!
    difotScores: [ReportsSuppliersDifotScore!]!
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
`;

export const queries = `
  reportsSuppliers(
    dateInterval: ReportsSuppliersFilterDateInterval,
    affiliation: ReportsSuppliersFilterAffiliation,
    sectCodes: [String!],
    statuses: [ReportsSuppliersFilterStatus!],
  ): [ReportsSupplier]
`;
