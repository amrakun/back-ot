import customScalars from './customScalars';
import Tender from './tender';
import Company from './company';
import Feedback from './feedback';
import FeedbackResponse from './feedbackResponse';
import BlockedCompany from './blockedCompany';
import Qualification from './qualification';
import Audit from './audit';
import ReportsSupplier from './report';

import Mutation from './mutations';
import Query from './queries';

export default {
  ...customScalars,

  Company,
  Tender,
  Feedback,
  FeedbackResponse,
  BlockedCompany,
  Qualification,
  Audit,

  Mutation,
  Query,
  ReportsSupplier,
};
