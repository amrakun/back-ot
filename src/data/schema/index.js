import { types as UserTypes, queries as UserQueries, mutations as UserMutations } from './user';

import {
  types as CompanyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations,
} from './company';

import {
  types as TenderTypes,
  queries as TenderQueries,
  mutations as TenderMutations,
} from './tender';

export const types = `
  scalar JSON
  scalar Date

  ${CompanyTypes}
  ${TenderTypes}
  ${UserTypes}
`;

export const queries = `
  type Query {
    ${CompanyQueries}
    ${TenderQueries}
    ${UserQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${CompanyMutations}
    ${TenderMutations}
    ${UserMutations}
  }
`;
