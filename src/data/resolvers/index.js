import customScalars from './customScalars';
import Tender from './tender';
import Company from './company';
import Feedback from './feedback';
import Mutation from './mutations';
import Query from './queries';

export default {
  ...customScalars,

  Company,
  Tender,
  Feedback,

  Mutation,
  Query,
};
