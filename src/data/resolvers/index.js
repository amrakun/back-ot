import customScalars from './customScalars';
import Tender from './tender';
import Company from './company';
import Feedback from './feedback';
import BlockedCompany from './blockedCompany';
import Qualification from './qualification';

import Mutation from './mutations';
import Query from './queries';

export default {
  ...customScalars,

  Company,
  Tender,
  Feedback,
  BlockedCompany,
  Qualification,

  Mutation,
  Query,
};
