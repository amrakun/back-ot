import users from './users';
import companies from './companies';
import tenders from './tenders';
import tenderResponses from './tenderResponses';
import tenderResponseExports from './tenderResponseExports';
import feedbacks from './feedbacks';
import blockedCompanies from './blockedCompanies';
import physicalAudits from './physicalAudits';
import qualifications from './qualifications';
import audits from './audits';
import auditExports from './auditExports';
import reports from './reports';
import configs from './configs';
import massMails from './massMails';
import permissions from './permissions';

export default {
  ...users,
  ...companies,
  ...tenders,
  ...tenderResponses,
  ...tenderResponseExports,
  ...feedbacks,
  ...blockedCompanies,
  ...physicalAudits,
  ...qualifications,
  ...audits,
  ...auditExports,
  ...reports,
  ...configs,
  ...massMails,
  ...permissions,
};
