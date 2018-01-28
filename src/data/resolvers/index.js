import customScalars from './customScalars';
import Tender from './tender';
import SupplierTender from './supplierTender';
import Company from './company';
import Feedback from './feedback';
import FeedbackResponse from './feedbackResponse';
import BlockedCompany from './blockedCompany';
import Qualification from './qualification';
import Audit from './audit';
import AuditResponse from './auditResponse';

import Mutation from './mutations';
import Query from './queries';

export default {
  ...customScalars,

  Company,
  SupplierTender,
  Tender,
  Feedback,
  FeedbackResponse,
  BlockedCompany,
  Qualification,
  Audit,
  AuditResponse,

  Mutation,
  Query,
};
