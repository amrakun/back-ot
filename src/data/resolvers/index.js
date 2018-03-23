import customScalars from './customScalars';
import Tender from './tender';
import TenderResponse from './tenderResponse';
import SupplierTender from './supplierTender';
import Company from './company';
import CompanyDueDiligence from './dueDiligence';
import Feedback from './feedback';
import FeedbackResponse from './feedbackResponse';
import BlockedCompany from './blockedCompany';
import Qualification from './qualification';
import Audit from './audit';
import AuditResponse from './auditResponse';
import PhysicalAudit from './physicalAudit';
import MassMail from './massMail';

import Mutation from './mutations';
import Query from './queries';

export default {
  ...customScalars,

  Company,
  CompanyDueDiligence,
  SupplierTender,
  Tender,
  TenderResponse,
  Feedback,
  FeedbackResponse,
  BlockedCompany,
  Qualification,
  Audit,
  AuditResponse,
  PhysicalAudit,
  MassMail,

  Mutation,
  Query,
};
