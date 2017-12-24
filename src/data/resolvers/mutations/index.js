import companies from './companies';
import users from './users';
import tenders from './tenders';
import tenderResponses from './tenderResponses';

export default {
  ...companies,
  ...users,
  ...tenders,
  ...tenderResponses,
};
