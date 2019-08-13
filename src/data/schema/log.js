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

  type Log {
    _id: String
    createdAt: Date
    createdBy: String
    type: String
    action: String
    objectId: String
    unicode: String
    description: String
    addedData: String
    removedData: String
    changedData: String
    unchangedData: String
  }

  type LogList {
    logs: [Log]
    totalCount: Int
  }

  type Field {
    name: String
    label: String
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
  logsSuppliersByProductCodeLogsExport(
    startDate: Date!,
    endDate: Date!,
    productCodes: [String!]
  ): String
  logsActivityLogsExport(startDate: Date!, endDate: Date!, module: String): String

  logsTender(page: Int, perPage: Int, tenderId: String): [TenderLog]
  logsTenderTotalCount(tenderId: String): Int

  logs(
    start: String,
    end: String,
    userId: String,
    action: String,
    page: Int,
    perPage: Int,
    type: String,
    desc: String
  ): LogList

  getDbFieldLabels(type: String): [Field]
`;

export const mutations = `
  logsWrite(apiCall: String!): Boolean
`;
