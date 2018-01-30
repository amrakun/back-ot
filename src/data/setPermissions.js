import auditsQueries from '../data/resolvers/queries/audits';
import auditExportsQueries from '../data/resolvers/queries/auditExports';
import auditMutations from '../data/resolvers/mutations/audits';

import blockedCompaniesQueries from '../data/resolvers/queries/blockedCompanies';
import blockedCompaniesMutations from '../data/resolvers/mutations/blockedCompanies';

import companiesQueries from '../data/resolvers/queries/companies';
import companiesMutations from '../data/resolvers/mutations/companies';

import configsQueries from '../data/resolvers/queries/configs';
import configsMutations from '../data/resolvers/mutations/configs';

import feedbacksQueries from '../data/resolvers/queries/feedbacks';
import feedbacksMutations from '../data/resolvers/mutations/feedbacks';
import feedbackResponsesMutations from '../data/resolvers/mutations/feedbackResponses';

import physicalAuditsQueries from '../data/resolvers/queries/physicalAudits';
import physicalAuditsMutations from '../data/resolvers/mutations/physicalAudits';

import qualificationsQueries from '../data/resolvers/queries/qualifications';
import qualificationsMutations from '../data/resolvers/mutations/qualifications';

import reportsQueries from '../data/resolvers/queries/reports';

import tendersQueries from '../data/resolvers/queries/tenders';
import tenderResponsesQueries from '../data/resolvers/queries/tenderResponses';
import tenderResponseExportsQueries from '../data/resolvers/queries/tenderResponseExports';
import tendersMutations from '../data/resolvers/mutations/tenders';
import tenderResponsesMutations from '../data/resolvers/mutations/tenderResponses';

import usersQueries from '../data/resolvers/queries/users';
import usersMutations from '../data/resolvers/mutations/users';

import { PERMISSIONS } from './constants';

/**
 * Set permissions to constants.PERMISSIONS
 */
export default () => {
  const data = {
    audits: [auditsQueries, auditExportsQueries, auditMutations],
    blockedCompanies: [blockedCompaniesQueries, blockedCompaniesMutations],
    companies: [companiesQueries, companiesMutations],
    configs: [configsQueries, configsMutations],
    feedbacks: [feedbacksQueries, feedbacksMutations, feedbackResponsesMutations],
    physicalAudits: [physicalAuditsQueries, physicalAuditsMutations],
    qualifications: [qualificationsQueries, qualificationsMutations],
    reports: [reportsQueries],
    tenders: [
      tendersQueries,
      tenderResponsesQueries,
      tenderResponseExportsQueries,
      tendersMutations,
      tenderResponsesMutations,
    ],
    users: [usersQueries, usersMutations],
  };

  for (let dataKey of Object.keys(data)) {
    PERMISSIONS[dataKey] = PERMISSIONS[dataKey] || [];

    for (let items of data[dataKey]) {
      for (let item of Object.keys(items)) {
        PERMISSIONS[dataKey].push(item);
      }
    }
  }
};
