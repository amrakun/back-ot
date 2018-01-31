export const types = `
  type ModulePermissions {
    name: String!
    permissions: [String]
  }
`;

export const queries = `
  modulePermissions: [ModulePermissions]
`;
