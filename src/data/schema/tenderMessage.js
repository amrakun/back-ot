export const types = `
  type TenderMessageAttachment {
    name: String!
    url:  String!
  }

  input TenderMessageAttachmentInput {
    name: String!
    url:  String!
  }

  type TenderMessage {
    _id:                 String
    tender:              Tender!
    senderBuyer:         User
    recipientSuppliers: [Company]
    senderSupplier:      Company
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
    tenderId: String
  ): [TenderMessage]

  tenderMessageDetail(_id: String): TenderMessage
`;

export const mutations = `
  tenderMessageBuyerSend(
    tenderId:              String!,
    recipientSupplierIds: [String!]!,
    subject:               String!,
    body:                  String!,
    attachment:            TenderMessageAttachmentInput
  ): TenderMessage

  tenderMessageSupplierSend(
    tenderId:              String!,
    subject:               String!,
    body:                  String!,
    attachment:            TenderMessageAttachmentInput
  ): TenderMessage
`;
