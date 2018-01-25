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

import {
  types as BlockedCompanyTypes,
  mutations as BlockedCompanyMutations,
  queries as BlockedCompanyQueries,
} from './blockedCompany';

import {
  types as QualificationTypes,
  queries as QualificationQueries,
  mutations as QualificationMutations,
} from './qualification';

import { types as AuditTypes, queries as AuditQueries, mutations as AuditMutations } from './audit';

import { types as ReportTypes, queries as ReportQueries } from './report';

import {
  types as ConfigTypes,
  queries as ConfigQueries,
  mutations as ConfigMutations,
} from './config';

export const types = `
  scalar JSON
  scalar Date

  ${UserTypes}
  ${CompanyTypes}
  ${TenderTypes}
  ${FeedbackTypes}
  ${BlockedCompanyTypes}
  ${QualificationTypes}
  ${AuditTypes}
  ${ReportTypes}
  ${ConfigTypes}
`;

export const queries = `
  type Query {
    ${UserQueries}
    ${CompanyQueries}
    ${TenderQueries}
    ${FeedbackQueries}
    ${BlockedCompanyQueries}
    ${QualificationQueries}
    ${AuditQueries}
    ${ReportQueries}
    ${ConfigQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${CompanyMutations}
    ${TenderMutations}
    ${UserMutations}
    ${FeedbackMutations}
    ${BlockedCompanyMutations}
    ${QualificationMutations}
    ${AuditMutations}
    ${ConfigMutations}
  }
`;
