import users from './users';
import companies from './companies';
import tenders from './tenders';
import tenderResponses from './tenderResponses';
import tenderResponseExports from './tenderResponseExports';
import feedbacks from './feedbacks';
import blockedCompanies from './blockedCompanies';
import qualifications from './qualifications';
import audits from './audits';
import auditExports from './auditExports';
import reports from './reports';

export default {
  ...users,
  ...companies,
  ...tenders,
  ...tenderResponses,
  ...tenderResponseExports,
  ...feedbacks,
  ...blockedCompanies,
  ...qualifications,
  ...audits,
  ...auditExports,
  ...reports,
};
