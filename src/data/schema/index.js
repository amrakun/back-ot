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

import {
  types as FeedbackTypes,
  queries as FeedbackQueries,
  mutations as FeedbackMutations,
} from './feedback';

export const types = `
  scalar JSON
  scalar Date

  ${UserTypes}
  ${CompanyTypes}
  ${TenderTypes}
  ${FeedbackTypes}
`;

export const queries = `
  type Query {
    ${UserQueries}
    ${CompanyQueries}
    ${TenderQueries}
    ${FeedbackQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${CompanyMutations}
    ${TenderMutations}
    ${UserMutations}
    ${FeedbackMutations}
  }
`;
