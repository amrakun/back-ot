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
  currency: String
  leadTime: Float
  shippingTerms: String
  comment: String
  alternative: String
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
  rfqType: String
  createdDate: Date
  number: String!
  name: String!
  content: String!
  attachments: [JSON]
  publishDate: Date!
  closeDate: Date!
  sourcingOfficer: String
  file: JSON
  reminderDay: Float
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
    winnerIds: [String]
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
    respondedFiles: [JSON]

    supplier: Company

    status: String
    isSent: Boolean
    isNotInterested: Boolean
  }
`;

const tenderQueryParams = `
  page: Int
  perPage: Int
  type: String
  status: String
  search: String
  month: Date
  sortField: String
  sortDirection: Int
`;

export const queries = `
  tenders(${tenderQueryParams}): [Tender]
  tendersBuyerTotalCount(${tenderQueryParams}): Float

  tendersSupplier(${tenderQueryParams}): [SupplierTender]
  tendersSupplierTotalCount(${tenderQueryParams}): Float
  tendersExport(${tenderQueryParams}): String

  tenderDetail(_id: String!): Tender
  tenderDetailSupplier(_id: String!): SupplierTender
  tenderGenerateMaterialsTemplate(tenderId: String!): String

  tenderResponses(
    tenderId: String!
    sort: JSON
    betweenSearch: JSON
    supplierSearch: String
    isNotInterested: Boolean
  ): [TenderResponse]

  tenderResponseNotRespondedSuppliers(tenderId: String): [Company]

  tenderResponseDetail(_id: String!): TenderResponse
  tenderResponseByUser(tenderId: String!): TenderResponse

  tenderResponsesRfqBidSummaryReport(
    tenderId: String!
    supplierIds: [String!]!
  ): String

  tenderResponsesEoiShortList(
    tenderId: String!
    supplierIds: [String!]!
  ): String

  tenderResponsesEoiBidderList(
    tenderId: String!
    supplierIds: [String!]!
  ): String

  tenderCountByStatus(
    startDate: Date!
    endDate: Date!
    type: String!
  ): JSON

  tendersTotalCountReport(
    startDate: Date!
    endDate: Date!
    type: String!
  ): Float

  tendersAverageDuration(
    startDate: Date!
    endDate: Date!
    type: String!
  ): Float
`;

const commonParams = `
  number: String!
  name: String!
  content: String!
  attachments: [JSON]
  publishDate: Date!
  closeDate: Date!
  file: JSON
  sourcingOfficer: String
  reminderDay: Float
  supplierIds: [String]!
  requestedProducts: [TenderRequestedProductInput]
  requestedDocuments: [String]
`;

const responseCommonParams = `
  tenderId: String!
  isNotInterested: Boolean
  respondedProducts: [TenderRespondedProductInput]
  respondedDocuments: [TenderRespondedDocumentInput]
  respondedFiles: [JSON]
`;

export const mutations = `
  tendersAdd(type: String!, rfqType: String, ${commonParams}): Tender
  tendersEdit(_id: String!, ${commonParams}): Tender
  tendersRemove(_id: String!): String

  tendersAward(_id: String!  supplierIds: [String!]!): Tender

  tendersSendRegretLetter(
    _id: String!
    subject: String!
    content: String!
  ): [String]

  tendersCancel(_id: String!): Tender

  tenderResponsesAdd(${responseCommonParams}): TenderResponse
  tenderResponsesEdit(${responseCommonParams}): TenderResponse

  tenderResponsesSend(
    tenderId: String
    supplierId: String
  ): TenderResponse
`;
