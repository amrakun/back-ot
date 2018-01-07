export const types = `
  type Feedback {
    _id: String!
    status: String,
    closeDate: Date,
    supplierIds: [String],
    content: String,
    createdDate: Date,
    createdUserId: String,
  }

  type FeedbackResponse {
    _id: String!
    status: String,
    feedbackId: String,
    supplierId: String,
    employmentNumberBefore: Float,
    employmentNumberNow: Float,
    nationalSpendBefore: Float,
    nationalSpendAfter: Float,
    umnugobiSpendBefore: Float,
    umnugobiSpendAfter: Float,
    investment: String,
    trainings: String,
    corporateSocial: String,
    technologyImprovement: String,
  }
`;

export const queries = `
`;

export const mutations = `
  feedbacksAdd(
    closeDate: Date!,
    supplierIds: [String]!,
    content: String!
  ): Feedback

  feedbackResponsesAdd(
    feedbackId: String!,
    supplierId: String!,
    employmentNumberBefore: Float!,
    employmentNumberNow: Float!,
    nationalSpendBefore: Float!,
    nationalSpendAfter: Float!,
    umnugobiSpendBefore: Float!,
    umnugobiSpendAfter: Float!,
    investment: String!,
    trainings: String!,
    corporateSocial: String!,
    technologyImprovement: String!,
  ): FeedbackResponse
`;
