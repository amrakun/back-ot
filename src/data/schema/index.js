import { types as UserTypes, queries as UserQueries, mutations as UserMutations } from './user';

import {
  types as CompanyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations,
} from './company';

export const types = `
  scalar JSON
  scalar Date

  ${CompanyTypes}
  ${UserTypes}
`;

export const queries = `
  type Query {
    ${CompanyQueries}
    ${UserQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${CompanyMutations}
    ${UserMutations}
  }
`;
