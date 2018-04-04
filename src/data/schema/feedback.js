export const types = `
  type Feedback {
    _id: String!
    status: String
    closeDate: Date
    supplierIds: [String]
    content: String
    createdDate: Date
    createdUserId: String

    responses: [FeedbackResponse]
    supplierResponse: FeedbackResponse
  }

  type FeedbackResponse {
    _id: String!
    status: String
    feedbackId: String
    supplierId: String

    totalEmploymentOt: Float
    totalEmploymentUmnugobi: Float
    employmentChangesAfter: Float
    numberOfEmployeeWorkToScopeNational: Float
    numberOfEmployeeWorkToScopeUmnugobi: Float
    procurementTotalSpend: Float
    procurementNationalSpend: Float
    procurementUmnugobiSpend: Float

    corporateSocial: String
    otherStories: String

    feedback: Feedback
    supplier: Company

    createdDate: Date
  }
`;

export const queries = `
  feedbacks: [Feedback]
  feedbackResponses(supplierName: String): [FeedbackResponse]
  feedbackResponsesExport(supplierName: String, supplierIds: [String]): String
  feedbackDetail(_id: String!): Feedback
`;

export const mutations = `
  feedbacksAdd(
    closeDate: Date!,
    supplierIds: [String]!,
    content: String!
  ): Feedback

  feedbackResponsesAdd(
    feedbackId: String!
    supplierId: String!

    totalEmploymentOt: Float!
    totalEmploymentUmnugobi: Float!
    employmentChangesAfter: Float!
    numberOfEmployeeWorkToScopeNational: Float!
    numberOfEmployeeWorkToScopeUmnugobi: Float!
    procurementTotalSpend: Float!
    procurementNationalSpend: Float!
    procurementUmnugobiSpend: Float!

    corporateSocial: String!
    otherStories: String!
  ): FeedbackResponse
`;
