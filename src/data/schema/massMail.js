export const types = `
  type MailDelivery {
    _id: String!

    from: String
    to: String
    subject: String
    html: String
    attachments: [JSON] 
    status: String
    createdDate: Date
  }
`;

export const mutations = `
  massMailsSend(supplierIds: [String!]!  subject: String, content: String): MailDelivery
`;

export const queries = `
  mailDeliveries(page: Int, perPage: Int, search: String, old: Boolean): [MailDelivery]
  mailDeliveriesTotalCount(search: String, old: Boolean): Int
`;
