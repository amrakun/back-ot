export const types = `
  type PhysicalAudit {
    _id: String!
    createdDate: Date
    createdUserId: String
    supplierId: String
    isQualified: Boolean
    reportFile: String
    improvementPlanFile: String

    createdUser: User
    supplier: Company
  }
`;

export const queries = `
  physicalAudits(supplierSearch: String, page: Int, perPage: Int): [PhysicalAudit]
  totalPhysicalAudits(supplierSearch: String): Int
  physicalAuditDetail(_id: String!): PhysicalAudit
`;

const commonParams = `
  isQualified: Boolean!,
  supplierId: String!,
  reportFile: String!
  improvementPlanFile: String!
`;

export const mutations = `
  physicalAuditsAdd(${commonParams}): PhysicalAudit
  physicalAuditsEdit(_id: String!, ${commonParams}): PhysicalAudit
  physicalAuditsRemove(_id: String!): String
`;
