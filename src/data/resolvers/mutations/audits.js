import { Companies, Audits, AuditResponses } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import utils from '../../../data/utils';

const auditMutations = {
  // create new audit
  auditsAdd(root, args, { user }) {
    return Audits.createAudit(args, user._id);
  },

  // save basic info
  auditsSupplierSaveBasicInfo(root, { auditId, supplierId, basicInfo }) {
    return AuditResponses.saveBasicInfo({ auditId: auditId, supplierId, doc: basicInfo });
  },

  // save evidence info
  auditsSupplierSaveEvidenceInfo(root, { auditId, supplierId, evidenceInfo }) {
    return AuditResponses.saveEvidenceInfo({ auditId: auditId, supplierId, doc: evidenceInfo });
  },

  // mark response as sent
  async auditsSupplierSendResponse(root, { auditId, supplierId }) {
    const response = await AuditResponses.findOne({ auditId: auditId, supplierId });

    if (response) {
      return response.send();
    }

    return null;
  },

  /**
   * Send report files to supplier via email
   * @param {Boolean} improvementPlan - Is sent improvementPlan email
   * @param {Boolean} report - Is sent report email
   * @return - Updated response
   */
  async auditsBuyerSendFiles(root, { auditId, supplierId, improvementPlan, report }) {
    const company = await Companies.findOne({ _id: supplierId });
    const response = await AuditResponses.findOne({ auditId: auditId, supplierId });

    // collection attachments =========
    const attachments = [];

    if (improvementPlan && response.improvementPlanFile) {
      attachments.push({
        filename: 'improvement_plan.xlsx',
        path: response.improvementPlanFile,
      });
    }

    if (report && response.reportFile) {
      attachments.push({
        filename: 'report.xlsx',
        path: response.reportFile,
      });
    }

    const contactInfo = company.contactInfo || {};

    // send email ===================
    utils.sendEmail({
      toEmails: [contactInfo.email],
      title: 'Desktop audit report',
      template: {
        name: 'audit',
        data: {
          content: 'Desktop audit report',
        },
      },
      attachments,
    });

    // save dates
    return response.saveEmailSenDates(improvementPlan, report);
  },
};

const sections = ['coreHseqInfo', 'hrInfo', 'businessInfo'];

// create section mutations ===========
sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  const mutation = (root, args) => {
    return AuditResponses.saveReplyRecommentSection({
      auditId: args.auditId,
      supplierId: args.supplierId,
      name: section,
      doc: args[section],
    });
  };

  // supplier mutation
  const supplierName = `auditsSupplierSave${capsedName}`;
  auditMutations[supplierName] = mutation;
  requireSupplier(auditMutations, supplierName);

  // buyer mutation
  const buyerName = `auditsBuyerSave${capsedName}`;
  auditMutations[buyerName] = mutation;
  requireBuyer(auditMutations, buyerName);
});

requireBuyer(auditMutations, 'auditsAdd');
requireBuyer(auditMutations, 'auditsBuyerSendFiles');

requireSupplier(auditMutations, 'auditsSupplierSaveBasicInfo');
requireSupplier(auditMutations, 'auditsSupplierSaveEvidenceInfo');
requireSupplier(auditMutations, 'auditsSupplierSendResponse');

export default auditMutations;
