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
    number: Float!,
    name: String!,
    content: String!,
    publishDate: Date!,
    closeDate: Date!,
    file: JSON!,
    reminderDay: Float!,
    supplierIds: [String]!,
    requestedProducts: [TenderRequestedProduct]!
  }
`;

export const queries = `
  tenders(page: Int, perPage: Int): [Tender]
  tenderDetail(_id: String!): Tender
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

export const mutations = `
  tendersAdd(type: String!, ${commonParams}): Tender
  tendersEdit(_id: String!, ${commonParams}): Tender
  tendersRemove(_id: String!): String
`;
