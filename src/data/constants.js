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
  'companyRegistrationExport',
  'usersAdd',
  'usersEdit',
  'usersRemove',
  'tenderResponsesEoiShortList',
  'tenderResponsesEoiBidderList',
  'feedbacksAdd',
  'companiesGenerateDifotScoreList',
  'companiesGenerateDueDiligenceList',
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
    permissions: ['companiesAddDueDiligences', 'companiesGenerateDueDiligenceList'],
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
    permissions: ['reportsTendersExport', 'reportsAuditExport', 'companyRegistrationExport'],
  },
  {
    name: 'Settings',
    permissions: ['usersAdd', 'usersEdit', 'usersRemove'],
  },
];

export const MODULES = {
  DASHBOARD: 'dashboard',
  SUPPLIERS: 'companies',
  PRE_QUALIFICATION: 'prequalification-status',
  QUALIFICATION_SEND: 'audit',
  QUALIFICATION_RESPONSES_DESKTOP: 'audit/responses',
  QUALIFICATION_RESPONSES_PHYSICAL: 'audit/responses-physical',
  QUALIFICATION_R_I_PLAN: 'audit/reports',
  VALIDATION: 'validation',
  DIFOT_SCORE: 'difot',
  DUE_DILIGENCE: 'due-diligence',
  SUCCESS_FEEDBACK_REQUEST_FEEDBACK: 'feedback',
  SUCCESS_FEEDBACK_RESPONSES: 'feedback/responses',
  BLOCK_SUPPLIER: 'blocking',
  RFQ: 'rfq',
  EOI_RESPONSES: 'eoi',
  REPORTS: 'report',
  LOGS: 'logs',
  SETTINGS_TEMPLATES: 'settings/templates',
  SETTINGS_EXPIRY_DATES: 'settings/manage-expiry-dates',
  SETTINGS_USER_LIST: 'user-list',
  ALL: [
    'dashboard',
    'companies',
    'prequalification-status',
    'audit',
    'audit/responses',
    'audit/responses-physical',
    'audit/reports',
    'validation',
    'difot',
    'due-diligence',
    'feedback',
    'feedback/responses',
    'blocking',
    'rfq',
    'eoi',
    'report',
    'logs',
    'settings/templates',
    'settings/manage-expiry-dates',
    'user-list',
  ],
};

export const MODULES_TO_TEXT = {
  dashboard: 'Dashboard',
  companies: 'Suppliers',
  'prequalification-status': 'Pre-qualification',
  audit: 'Qualification',
  'audit/responses': 'Qualification Responses (desktop)',
  'audit/responses-physical': 'Qualification Responses (physical)',
  'audit/reports': 'Qualifications Report & Plan',
  validation: 'Validation',
  difot: 'DIFOT score',
  'due-diligence': 'Due Dilligence',
  feedback: 'Success feedback - request feedback',
  'feedback/responses': 'Success feedback - responses',
  blocking: 'Block supplier',
  rfq: 'RFQ responses',
  eoi: 'EOI responses',
  report: 'Report',
  logs: 'Log',
  'settings/templates': 'Settings - Templates',
  'settings/manage-expiry-dates': 'Settings - Manage expiry dates',
  'user-list': 'Settings - Manage users',
};
