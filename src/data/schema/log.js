export const types = `
  type TenderLog {
    _id:         String!
    tender:      Tender!
    user:        User
    isAuto:      Boolean!
    action:      String!
    description: String!
    createdAt:   Date!
  }
`;

export const queries = `
  logsSupplierLoginsExport(startDate: Date!, endDate: Date!): String
  logsBuyerLoginsExport(startDate: Date!, endDate: Date!): String
  logsSupplierLoginsByEoiSubmissionsExport(startDate: Date!, endDate: Date!): String
  logsSupplierLoginsByRfqSubmissionsExport(startDate: Date!, endDate: Date!): String
  logsSearchesPerBuyerExport(startDate: Date!, endDate: Date!): String
  logsEoiCreatedAndSentExport(startDate: Date!, endDate: Date!): String
  logsRfqCreatedAndSentExport(startDate: Date!, endDate: Date!): String
  logsSuppliersByProductCodeLogsExport(startDate: Date!, endDate: Date!, productCodes: [String!]): String
  logsActivityLogsExport(startDate: Date!, endDate: Date!, module: String): String

  logsTenders(page: Int, perPage: Int, tenderId: String): [TenderLog]
  logsTenderDetail(_id: String!): TenderLog
  logsTenderCount(tenderId: String): Int
`;

export const mutations = `
  logsWrite(apiCall: String!): Boolean
`;
