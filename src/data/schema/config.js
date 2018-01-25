export const types = `
  input ConfigDurationAmount {
    duration: String!
    amount: Float!
  }

  input ConfigSuppliersDurationAmount {
    supplierIds: [String]!
    duration: String!
    amount: Float!
  }

  input ConfigTierTypeDurationAmount {
    tierType: String!
    duration: String!
    amount: Float!
  }

  input ConfigSuppliersTierTypeDurationAmount {
    supplierIds: [String]!
    tierType: String!
    duration: String!
    amount: Float!
  }

  input ConfigPrequalificationDowInput {
    common: ConfigDurationAmount!
    specific: ConfigSuppliersDurationAmount
  }

  input ConfigAuditDowInput {
    common: ConfigDurationAmount!
    specific: ConfigSuppliersDurationAmount
  }

  input ConfigImprovementPlanDowInput {
    common: ConfigTierTypeDurationAmount!
    specific: ConfigSuppliersTierTypeDurationAmount
  }

  type Config {
    _id: String!

    logo: String
    name: String
    phone: String
    email: String
    address: String

    eoiTemplate: String
    rfqTemplate: String
    regretLetterTemplate: String
    successFeedbackTemplate: String
    auditTemplate: String

    prequalificationDow: JSON
    specificPrequalificationDow: JSON

    auditDow: JSON
    specificAuditDow: JSON

    improvementPlanDow: JSON
    specificImprovementPlanDow: JSON
  }
`;

export const mutations = `
  configsSaveBasicInfo(
    logo: String!,
    name: String!,
    phone: String!,
    email: String!,
    address: String!,
  ): Config

  configsSaveTemplate(name: String!, content: String!): Config
  configsSavePrequalificationDow(doc: ConfigPrequalificationDowInput!): Config
  configsSaveAuditDow(doc: ConfigAuditDowInput!): Config
  configsSaveImprovementPlanDow(doc: ConfigImprovementPlanDowInput!): Config
`;

export const queries = `
  config: Config
`;
