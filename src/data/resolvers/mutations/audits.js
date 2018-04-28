import { Companies, Audits, AuditResponses } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import utils from '../../../data/utils';

const auditMutations = {
  // create new audit
  auditsAdd(root, args, { user }) {
    return Audits.createAudit(args, user._id);
  },

  // save basic info
  auditsSupplierSaveBasicInfo(root, { auditId, basicInfo }, { user }) {
    return AuditResponses.saveBasicInfo({
      auditId: auditId,
      supplierId: user.companyId,
      doc: basicInfo,
    });
  },

  // save evidence info
  auditsSupplierSaveEvidenceInfo(root, { auditId, evidenceInfo }, { user }) {
    return AuditResponses.saveEvidenceInfo({
      auditId: auditId,
      supplierId: user.companyId,
      doc: evidenceInfo,
    });
  },

  // mark response as sent
  async auditsSupplierSendResponse(root, { auditId }, { user }) {
    const response = await AuditResponses.findOne({
      auditId: auditId,
      supplierId: user.companyId,
    });

    let updatedResponse;

    if (response) {
      updatedResponse = await response.send();
    }

    // send email ===================
    const { MAIN_AUDITOR_EMAIL } = process.env;
    const supplier = await Companies.findOne({ _id: user.companyId });

    utils.sendEmail({
      toEmails: [MAIN_AUDITOR_EMAIL],
      title: 'New audit response notification',
      template: {
        name: 'audit',
        data: {
          content: `Supplier '${supplier.basicInfo.enName}' filled out and
            submitted supplier qualification questionnaire (date).`,
        },
      },
    });

    return updatedResponse;
  },

  /**
   * Save report files & reset dates
   * @param {Boolean} improvementPlan - File path
   * @param {Boolean} report - File path
   * @return - Updated response
   */
  async auditsBuyerSaveFiles(root, { auditId, supplierId, improvementPlan, report }) {
    const response = await AuditResponses.findOne({ auditId: auditId, supplierId });

    // save files
    return response.saveFiles({
      improvementPlanFile: improvementPlan,
      reportFile: report,
    });
  },

  /**
   * Send report files to supplier via email
   * @param {[String]} responseIds - Audit response ids
   * @param {Boolean} improvementPlan - Is sent improvementPlan email
   * @param {Boolean} report - Is sent report email
   * @return - Updated response
   */
  async auditsBuyerSendFiles(root, { responseIds, improvementPlan, report }) {
    for (const responseId of responseIds) {
      const response = await AuditResponses.findOne({ _id: responseId });
      const company = await Companies.findOne({ _id: response.supplierId });

      // collection attachments =========
      const attachments = [];

      if (improvementPlan) {
        attachments.push({
          filename: 'improvement_plan.xlsx',
          path: response.improvementPlanFile,
        });
      }

      if (report) {
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
      await response.sendFiles({ improvementPlan, report });
    }
  },
};

const sections = ['coreHseqInfo', 'hrInfo', 'businessInfo'];

// create section mutations ===========
sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  // supplier mutation ===========
  const supplierName = `auditsSupplierSave${capsedName}`;

  auditMutations[supplierName] = (root, args, { user }) => {
    return AuditResponses.saveReplyRecommentSection({
      auditId: args.auditId,
      supplierId: user.companyId,
      name: section,
      doc: args[section],
    });
  };

  requireSupplier(auditMutations, supplierName);

  // buyer mutation ==================
  const buyerName = `auditsBuyerSave${capsedName}`;

  auditMutations[buyerName] = async (root, args) => {
    await AuditResponses.markAsBuyerNotified({
      auditId: args.auditId,
      supplierId: args.supplierId,
    });

    return AuditResponses.saveReplyRecommentSection({
      auditId: args.auditId,
      supplierId: args.supplierId,
      name: section,
      doc: args[section],
    });
  };

  requireBuyer(auditMutations, buyerName);
});

requireBuyer(auditMutations, 'auditsAdd');
requireBuyer(auditMutations, 'auditsBuyerSaveFiles');
requireBuyer(auditMutations, 'auditsBuyerSendFiles');

requireSupplier(auditMutations, 'auditsSupplierSaveBasicInfo');
requireSupplier(auditMutations, 'auditsSupplierSaveEvidenceInfo');
requireSupplier(auditMutations, 'auditsSupplierSendResponse');

export default auditMutations;
