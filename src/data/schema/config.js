export const types = `
  input ConfigDurationAmount {
    duration: String!
    amount: Float!
  }

  input ConfigSupplierDurationAmount {
    supplierId: String!
    duration: String!
    amount: Float!
  }

  input ConfigTierTypeDurationAmount {
    tierType: String!
    duration: String!
    amount: Float!
  }

  input ConfigSupplierTierTypeDurationAmount {
    supplierId: String!
    tierType: String!
    duration: String!
    amount: Float!
  }

  input ConfigPrequalificationDowInput {
    common: ConfigDurationAmount!
    specifics: [ConfigSupplierDurationAmount]!
  }

  input ConfigAuditDowInput {
    common: ConfigDurationAmount!
    specifics: [ConfigSupplierDurationAmount]!
  }

  input ConfigImprovementPlanDowInput {
    common: ConfigTierTypeDurationAmount!
    specifics: [ConfigSupplierTierTypeDurationAmount]!
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

    prequalificationDow: JSON,
    specificPrequalificationDows: JSON,

    auditDow: JSON,
    specificAuditDows: JSON,

    improvementPlanDow: JSON,
    specificImprovementPlanDows: JSON,
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
`;
