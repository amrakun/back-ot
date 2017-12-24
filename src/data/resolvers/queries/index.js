import companies from './companies';
import tenders from './tenders';
import tenderResponses from './tenderResponses';
import users from './users';

export default {
  ...companies,
  ...tenders,
  ...tenderResponses,
  ...users,
};
