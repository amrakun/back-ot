const requestedProductFields = `
  code: String
  purchaseRequestNumber: Float
  shortText: String
  quantity: Float
  uom: String
  manufacturer: String
  manufacturerPartNumber: Float
`;

const respondedProductFields = `
  code: String
  suggestedManufacturer: String
  suggestedManufacturerPartNumber: Float
  unitPrice: Float
  totalPrice: Float
  leadTime: Float
  shippingTerms: String
  comment: String
  file: JSON
`;

const respondedDocumentFields = `
  name: String
  isSubmitted: Boolean
  notes: String
  file: JSON
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
    status: String!
    type: String!
    createdDate: String
    createdUserId: String!
    number: Float!
    name: String!
    content: String!
    publishDate: Date!
    closeDate: Date!
    file: JSON
    reminderDay: Float!
    supplierIds: [String]!
    requestedProducts: [TenderRequestedProduct]!
    requestedDocuments: [String]!

    winnerId: String
    sentRegretLetter: Boolean

    createdUser: User
    isAwarded: Boolean
    isParticipated: Boolean
    suppliers: [Company]!
    requestedCount: Int
    submittedCount: Int
    notInterestedCount: Int
    notRespondedCount: Int

    responses: [TenderResponseSub]
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
    isNotInterested: Boolean
    respondedProducts: [TenderRespondedProduct]
    respondedDocuments: [TenderRespondedDocument]
  }
`;

const tenderQueryParams = `
  page: Int,
  perPage: Int,
  type: String,
  status: String,
  search: String,
  supplierId: String,
  ignoreSubmitted: Boolean
`;

export const queries = `
  tenders(${tenderQueryParams}): [Tender]
  tendersExport(${tenderQueryParams}): String

  tenderDetail(_id: String!): Tender

  tenderResponses(page: Int, perPage: Int): [TenderResponse]
  tenderResponseDetail(_id: String!): TenderResponse

  tenderResponsesRfqBidSummaryReport(tenderId: String!, supplierIds: [String!]!): String
  tenderResponsesEoiShortList(tenderId: String!, supplierIds: [String!]!): String
  tenderResponsesEoiBidderList(tenderId: String!, supplierIds: [String!]!): String

  tenderCountByStatus(
    startDate: Date!,
    endDate: Date!
    type: String!
  ): JSON

  tendersTotalCount(
    startDate: Date!,
    endDate: Date!
    type: String!
  ): Float
`;

const commonParams = `
  number: Float!,
  name: String!,
  content: String!,
  publishDate: Date!,
  closeDate: Date!,
  file: JSON,
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
  tendersSendRegretLetter(_id: String!, subject: String!, content: String!): [String]

  tenderResponsesAdd(${responseCommonParams}): TenderResponse
`;
