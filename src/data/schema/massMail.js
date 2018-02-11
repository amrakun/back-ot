export const types = `
  type MassMail {
    _id: String!
    supplierIds: [String]
    subject: String
    content: String
    status: JSON

    suppliers: [Company]

    createdDate: Date
    createdUserId: String
  }
`;

export const mutations = `
  massMailsSend(supplierIds: [String!]!  subject: String, content: String): MassMail
`;

export const queries = `
  massMails: [MassMail]
`;
