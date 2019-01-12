export const types = `
  type TenderMessageAttachment {
    name: String!
    url:  String!
  }

  type TenderMessage {
    tender:              Tender!
    senderBuyer:         User
    recipientSuppliers: [User]
    senderSupplier:      User
    subject:             String!
    body:                String!
    attachment:          TenderMessageAttachment
    isAuto:              Boolean!
    isRead:              Boolean!
    isReplySent:         Boolean!
  }
`;

export const queries = `
  tenderMessages(
    page:     Int,
    perPage:  Int,
    tenderId: Int!
  ): [TenderMessage]

  tenderMessageDetail(_id: String): TenderMessage
`;

export const mutations = `
  tenderMessagesBuyerSend(
    tenderId:              String!,
    recipientSupplierIds: [String!],
    subject:               String,
    body:                  String,
    attachment:            Attachment
  ): [TenderMessage]

  tenderMessagesSupplierSend(
    tenderId:              String!,
    subject:               String!,
    body:                  String!,
    attachment:            Attachment
  ): [TenderMessage]
`;
