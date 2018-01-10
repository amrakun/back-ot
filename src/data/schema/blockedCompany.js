export const types = `
  type BlockedCompany {
    _id: String!
    supplierId: String!
    startDate: Date!,
    endDate: Date!,
    note: String
  }
`;

export const mutations = `
  blockedCompaniesBlock(
    supplierIds: [String!]!
    startDate: Date!
    endDate: Date!
    note: String
  ): String

  blockedCompaniesUnblock(supplierIds: [String!]!): String
`;

export const queries = `
`;
