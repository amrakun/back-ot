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

  input ConfigTierTypesDurationAmount {
    national: ConfigDurationAmount
    umnugovi: ConfigDurationAmount
    tier1: ConfigDurationAmount
    tier2: ConfigDurationAmount
    tier3: ConfigDurationAmount
  }

  input ConfigSuppliersTierTypesDurationAmount {
    supplierIds: [String]!
    national: ConfigDurationAmount
    umnugovi: ConfigDurationAmount
    tier1: ConfigDurationAmount
    tier2: ConfigDurationAmount
    tier3: ConfigDurationAmount
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
    common: ConfigTierTypesDurationAmount!
    specific: ConfigSuppliersTierTypesDurationAmount
  }

  type Config {
    _id: String!

    logo: String
    name: String
    phone: String
    email: String
    address: String

    rfqTemplates: JSON
    trfqTemplates: JSON
    eoiTemplates: JSON
    successFeedbackTemplates: JSON
    capacityBuildingTemplates: JSON
    blockTemplates: JSON
    prequalificationTemplates: JSON
    desktopAuditTemplates: JSON

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

  configsSaveTemplate(
    name: String!
    kind: String!
    from: String!
    subject: JSON!
    content: JSON!
  ): Config

  configsSavePrequalificationDow(doc: ConfigPrequalificationDowInput!): Config
  configsSaveAuditDow(doc: ConfigAuditDowInput!): Config
  configsSaveImprovementPlanDow(doc: ConfigImprovementPlanDowInput!): Config
`;

export const queries = `
  config: Config
`;
