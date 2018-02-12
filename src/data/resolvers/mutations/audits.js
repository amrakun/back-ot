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

    if (response) {
      return response.send();
    }

    return null;
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
   * @param {[String]} supplierIds - Supplier ids
   * @param {Boolean} improvementPlan - File path
   * @param {Boolean} report - File path
   * @return - Updated response
   */
  async auditsBuyerSendFiles(root, { auditId, supplierIds, improvementPlan, report }) {
    for (const supplierId of supplierIds) {
      const company = await Companies.findOne({ _id: supplierId });
      const response = await AuditResponses.findOne({ auditId: auditId, supplierId });

      // collection attachments =========
      const attachments = [];

      if (improvementPlan) {
        attachments.push({
          filename: 'improvement_plan.xlsx',
          path: improvementPlan,
        });
      }

      if (report) {
        attachments.push({
          filename: 'report.xlsx',
          path: report,
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

      // save files & dates
      await response.saveFiles({
        improvementPlanFile: improvementPlan,
        reportFile: report,
      });
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

  auditMutations[buyerName] = (root, args) => {
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
