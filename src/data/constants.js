export const ROLES = {
  ADMIN: 'admin',
  CONTRIBUTOR: 'contributor',
};

export const PERMISSION_LIST = [
  'physicalAuditsAdd',
  'configsSaveImprovementPlanDow',
  'companiesValidateProductsInfo',
  'companiesAddDueDiligences',
  'blockedCompaniesBlock',
  'blockedCompaniesUnblock',
  'tenderResponses',
  'tendersEdit',
  'tendersCancel',
  'tendersExport',
  'tendersSendRegretLetter',
  'tenderResponsesRfqBidSummaryReport',
  'tendersAward',
  'reportsTendersExport',
  'reportsAuditExport',
  'companyDetailExport',
  'usersAdd',
  'usersEdit',
  'usersRemove',
];

export const PERMISSIONS = [
  {
    name: 'Suppliers',
    permissions: [],
  },
  {
    name: 'Pre-qualification',
    permissions: [],
  },
  {
    name: 'Qualification',
    permissions: ['physicalAuditsAdd', 'configsSaveImprovementPlanDow'],
  },
  {
    name: 'Validation',
    permissions: ['companiesValidateProductsInfo'],
  },
  {
    name: 'Difot score',
    permissions: [],
  },
  {
    name: 'Due diligence',
    permissions: ['companiesAddDueDiligences'],
  },
  {
    name: 'Blocking',
    permissions: ['blockedCompaniesBlock', 'blockedCompaniesUnblock'],
  },
  {
    name: 'Success feedback',
    permissions: ['tenderResponses'],
  },
  {
    name: 'RFQ/EOI responses',
    permissions: ['tendersEdit', 'tendersCancel', 'tendersExport', 'tendersSendRegretLetter'],
  },
  {
    name: 'RFQ responses',
    permissions: ['tenderResponsesRfqBidSummaryReport', 'tendersAward'],
  },
  {
    name: 'EOI responses',
    permissions: [],
  },
  {
    name: 'Report',
    permissions: ['reportsTendersExport', 'reportsAuditExport', 'companyDetailExport'],
  },
  {
    name: 'Settings',
    permissions: ['usersAdd', 'usersEdit', 'usersRemove'],
  },
];
