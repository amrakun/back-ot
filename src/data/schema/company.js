export const types = `
  type Company {
    _id: String!
    name: String
  }
`;

export const queries = `
  companies(page: Int, perPage: Int): [Company]
  companyDetail(_id: String!): Company
`;

export const mutations = `
  companiesAdd(name: String): Company
  companiesEdit(_id: String!, name: String): Company
`;
