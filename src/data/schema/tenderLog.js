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
  tenderLogs(
    page:     Int,
    perPage:  Int,
    tenderId: String
  ):          [TenderLog]

  tenderLogDetail(_id: String!): TenderLog

  tenderLogCount(tenderId: String!): Int
`;
