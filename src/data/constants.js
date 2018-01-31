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
  'tenderResponsesEoiShortList',
  'tenderResponsesEoiBidderList',
  'feedbacksAdd',
  'companiesGenerateDifotScoreList',
  'companiesAddDifotScores',
  'qualificationsPrequalify',
  'qualificationsSaveTierType',
  'auditsAdd',
  'auditReport',
  'auditsBuyerSendFiles',
];

export const PERMISSIONS = [
  {
    name: 'Pre-qualification',
    permissions: ['qualificationsPrequalify', 'qualificationsSaveTierType'],
  },
  {
    name: 'Qualification',
    permissions: [
      'physicalAuditsAdd',
      'configsSaveImprovementPlanDow',
      'auditsAdd',
      'auditReport',
      'auditsBuyerSendFiles',
    ],
  },
  {
    name: 'Validation',
    permissions: ['companiesValidateProductsInfo'],
  },
  {
    name: 'Difot score',
    permissions: ['companiesGenerateDifotScoreList', 'companiesAddDifotScores'],
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
    permissions: ['tenderResponses', 'feedbacksAdd'],
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
    permissions: ['tenderResponsesEoiShortList', 'tenderResponsesEoiBidderList'],
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
