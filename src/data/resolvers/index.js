import customScalars from './customScalars';
import Tender from './tender';
import Company from './company';
import Mutation from './mutations';
import Query from './queries';

export default {
  ...customScalars,

  Tender,
  Company,

  Mutation,
  Query,
};
