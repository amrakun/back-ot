const requestedProductFields = `
  code: String,
  purchaseRequestNumber: Float,
  shortText: String,
  quantity: Float,
  uom: String,
  manufacturer: String,
  manufacturerPart: String,
`;

const respondedProductFields = `
  code: String,
  suggestedManufacturer: String,
  suggestedManufacturerPart: String,
  unitPrice: Float,
  totalPrice: Float,
  leadTime: Float,
  comment: String,
  file: JSON,
`;

export const types = `
  type TenderRequestedProduct {
    ${requestedProductFields}
  }

  input TenderRequestedProductInput {
    ${requestedProductFields}
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
    suppliers: [Company]!,
    requestedProducts: [TenderRequestedProduct]!
  }

  type TenderRespondedProduct {
    ${respondedProductFields}
  }

  input TenderRespondedProductInput {
    ${respondedProductFields}
  }

  type TenderResponse {
    _id: String!
    tenderId: String!
    supplierId: String!
    respondedProducts: [TenderRespondedProduct]!
  }
`;

export const queries = `
  tenders(page: Int, perPage: Int, type: String): [Tender]
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
  requestedProducts: [TenderRequestedProductInput]!
`;

const responseCommonParams = `
  tenderId: String!,
  supplierId: String!,
  respondedProducts: [TenderRespondedProductInput]!
`;

export const mutations = `
  tendersAdd(type: String!, ${commonParams}): Tender
  tendersEdit(_id: String!, ${commonParams}): Tender
  tendersRemove(_id: String!): String

  tenderResponsesAdd(${responseCommonParams}): TenderResponse
`;
