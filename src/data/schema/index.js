import {
  types as CompanyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations,
} from './company';


export const types = `
  scalar JSON
  scalar Date

  ${CompanyTypes}
`;

export const queries = `
  type Query {
    ${CompanyQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${CompanyMutations}
  }
`;
