export const queries = `
  logsSupplierLoginsExport(startDate: Date!, endDate: Date!): String
  logsBuyerLoginsExport(startDate: Date!, endDate: Date!): String
  logsSupplierLoginsByEoiSubmissionsExport(startDate: Date!, endDate: Date!): String
  logsSupplierLoginsByRfqSubmissionsExport(startDate: Date!, endDate: Date!): String
  logsSearchesPerBuyerExport(startDate: Date!, endDate: Date!): String
  logsEoiCreatedAndSentExport(startDate: Date!, endDate: Date!): String
  logsRfqCreatedAndSentExport(startDate: Date!, endDate: Date!): String
  logsSuppliersByProductCodeLogsExport(startDate: Date!, endDate: Date!, productCodes: [String!]): String
`;

export const mutations = `
  logsWrite(apiCall: String!): Boolean
`;
