import companies from './companies';
import users from './users';
import tenders from './tenders';
import tenderResponses from './tenderResponses';
import feedbacks from './feedbacks';
import feedbackResponses from './feedbackResponses';

export default {
  ...companies,
  ...users,
  ...tenders,
  ...tenderResponses,
  ...feedbacks,
  ...feedbackResponses,
};
