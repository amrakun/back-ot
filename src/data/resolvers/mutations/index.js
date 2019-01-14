import companies from './companies';
import users from './users';
import tenders from './tenders';
import tenderResponses from './tenderResponses';
import feedbacks from './feedbacks';
import feedbackResponses from './feedbackResponses';
import blockedCompanies from './blockedCompanies';
import qualifications from './qualifications';
import audits from './audits';
import physicalAudits from './physicalAudits';
import configs from './configs';
import massMails from './massMails';
import logs from './logs';
import TenderMessage from './TenderMessage';

export default {
  ...companies,
  ...users,
  ...tenders,
  ...tenderResponses,
  ...feedbacks,
  ...feedbackResponses,
  ...blockedCompanies,
  ...qualifications,
  ...audits,
  ...physicalAudits,
  ...configs,
  ...massMails,
  ...logs,
  ...TenderMessage,
};
