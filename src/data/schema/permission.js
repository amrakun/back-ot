export const types = `
  type Permission {
    name: String!
    module: String!
  }

  type ModulePermissions {
    name: String!
    permissions: [String]
  }
`;

export const queries = `
  permissions: [Permission]
  modulePermissions: [ModulePermissions]
`;
