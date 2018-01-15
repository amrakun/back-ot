export const types = `
  input ReportsSuppliersFilterDateInterval {
    startDate: Date
    endDate: Date
  }

  input ReportsSuppliersFilterAffiliation {
    country: String
    aimag: String
  }

  enum ReportsSuppliersFilterStatus {
    preQualified
    validate
  }

  type ReportsSupplier {
    _id: String!
    isParentExistingSup: Boolean
    enName: String!
    mnName: String
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
