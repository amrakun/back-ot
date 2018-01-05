const requestedProductFields = `
  code: String,
  purchaseRequestNumber: Float,
  shortText: String,
  quantity: Float,
  uom: String,
  manufacturer: String,
  manufacturerPartNumber: Float,
`;

const respondedProductFields = `
  code: String,
  suggestedManufacturer: String,
  suggestedManufacturerPartNumber: Float,
  unitPrice: Float,
  totalPrice: Float,
  leadTime: Float,
  comment: String,
  file: JSON,
`;

const respondedDocumentFields = `
  name: String,
  isSubmitted: Boolean,
  notes: String,
  file: JSON,
`;

export const types = `
  type TenderRequestedProduct {
    ${requestedProductFields}
  }

  input TenderRequestedProductInput {
    ${requestedProductFields}
  }

  type TenderResponseSub {
    supplier: Company,
    response: TenderResponse
  }

  type Tender {
    _id: String!
    type: String!
    number: Float!,
    name: String!,
    content: String!,
    publishDate: Date!,
    closeDate: Date!,
    file: JSON!,
    reminderDay: Float!,
    supplierIds: [String]!,
    requestedProducts: [TenderRequestedProduct]!
    requestedDocuments: [String]!

    winnerId: String,

    isAwarded: Boolean,
    suppliers: [Company]!,
    requestedCount: Int,
    submittedCount: Int,
    notInterestedCount: Int,
    notRespondedCount: Int,

    responses: [TenderResponseSub],
  }

  type TenderRespondedProduct {
    ${respondedProductFields}
  }

  input TenderRespondedProductInput {
    ${respondedProductFields}
  }

  type TenderRespondedDocument {
    ${respondedDocumentFields}
  }

  input TenderRespondedDocumentInput {
    ${respondedDocumentFields}
  }

  type TenderResponse {
    _id: String!
    tenderId: String!
    supplierId: String!
    isNotInterested: Boolean,
    respondedProducts: [TenderRespondedProduct]!
    respondedDocuments: [TenderRespondedDocument]!
  }
`;

export const queries = `
  tenders(
    page: Int,
    perPage: Int,
    type: String,
    supplierId: String
    ignoreSubmitted: Boolean,
  ): [Tender]

  tenderDetail(_id: String!): Tender

  tenderResponses(page: Int, perPage: Int): [TenderResponse]
  tenderResponseDetail(_id: String!): TenderResponse
`;

const commonParams = `
  number: Float!,
  name: String!,
  content: String!,
  publishDate: Date!,
  closeDate: Date!,
  file: JSON!,
  reminderDay: Float!,
  supplierIds: [String]!,
  requestedProducts: [TenderRequestedProductInput]
  requestedDocuments: [String]
`;

const responseCommonParams = `
  tenderId: String!,
  supplierId: String!,
  isNotInterested: Boolean,
  respondedProducts: [TenderRespondedProductInput]
  respondedDocuments: [TenderRespondedDocumentInput]
`;

export const mutations = `
  tendersAdd(type: String!, ${commonParams}): Tender
  tendersEdit(_id: String!, ${commonParams}): Tender
  tendersRemove(_id: String!): String
  tendersAward(_id: String!, supplierId: String!): Tender

  tenderResponsesAdd(${responseCommonParams}): TenderResponse
  tenderResponsesBidSummaryReport(tenderId: String!, supplierIds: [String!]!): String
`;
