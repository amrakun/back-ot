const productFields = `
  code: String,
  purchaseRequestNumber: Float,
  shortText: String,
  quantity: Float,
  uom: String,
  manufacturer: String,
  manufacturerPart: String,
  suggestedManufacturer: String,
  suggestedManufacturerPart: String,
  unitPrice: Float,
  totalPrice: Float,
  leadTime: Float,
  comment: String,
  picture: JSON,
`;

export const types = `
  type TenderRequestedProduct {
    ${productFields}
  }

  input TenderRequestedProductInput {
    ${productFields}
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
