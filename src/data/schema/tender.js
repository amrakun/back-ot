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

const commonTenderFields = `
  _id: String!
  status: String!
  type: String!
  createdDate: Date
  number: String!
  name: String!
  content: String!
  publishDate: Date!
  closeDate: Date!
  sourcingOfficer: String
  file: JSON
  reminderDay: Float!
  requestedProducts: [TenderRequestedProduct]!
  requestedDocuments: [String]!
  isAwarded: Boolean
`;

export const types = `
  type TenderRequestedProduct {
    ${requestedProductFields}
  }

  input TenderRequestedProductInput {
    ${requestedProductFields}
  }

  type SupplierTender {
    ${commonTenderFields}
    isParticipated: Boolean
    isSent: Boolean
  }

  type Tender {
    ${commonTenderFields}
    supplierIds: [String]!
    createdUserId: String!
    winnerId: String
    sentRegretLetter: Boolean
    isAwarded: Boolean
    suppliers: [Company]!
    requestedCount: Int
    submittedCount: Int
    notInterestedCount: Int
    notRespondedCount: Int

    createdUser: User
    responses: [TenderResponse]
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
    respondedProducts: [TenderRespondedProduct]
    respondedDocuments: [TenderRespondedDocument]

    supplier: Company

    isSent: Boolean
    isNotInterested: Boolean
  }
`;

const tenderQueryParams = `
  page: Int,
  perPage: Int,
  type: String,
  status: String,
  search: String,
  sortField: String,
  sortDirection: Int,
`;

export const queries = `
  tenders(${tenderQueryParams}): [Tender]
  tendersSupplier(${tenderQueryParams}): [SupplierTender]
  tendersExport(${tenderQueryParams}): String

  tenderDetail(_id: String!): Tender
  tenderDetailSupplier(_id: String!): SupplierTender

  tenderResponses(page: Int, perPage: Int): [TenderResponse]
  tenderResponseDetail(_id: String!): TenderResponse
  tenderResponseByUser(tenderId: String!): TenderResponse

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

  tendersAverageDuration(
    startDate: Date!,
    endDate: Date!
    type: String!
  ): Float
`;

const commonParams = `
  number: String!,
  name: String!,
  content: String!,
  publishDate: Date!,
  closeDate: Date!,
  file: JSON,
  sourcingOfficer: String,
  reminderDay: Float!,
  supplierIds: [String]!,
  requestedProducts: [TenderRequestedProductInput]
  requestedDocuments: [String]
`;

const responseCommonParams = `
  tenderId: String!,
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
  tendersCancel(_id: String!): Tender

  tenderResponsesAdd(${responseCommonParams}): TenderResponse
  tenderResponsesEdit(${responseCommonParams}): TenderResponse
  tenderResponsesSend(tenderId: String, supplierId: String): TenderResponse
`;
