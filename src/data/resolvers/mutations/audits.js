import { Companies, Audits, AuditResponses } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmail } from '../../../data/auditUtils';

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
    const audit = await Audits.findOne({ _id: auditId });
    const supplier = await Companies.findOne({ _id: user.companyId });

    const response = await AuditResponses.findOne({
      auditId: auditId,
      supplierId: user.companyId,
    });

    let updatedResponse;

    if (response) {
      updatedResponse = await response.send();
    }

    // send email ===================
    sendEmail({
      kind: 'buyer__submit',
      toEmails: [process.env.MAIN_AUDITOR_EMAIL],
      supplierId: user.companyId,
      replacer: text => {
        return text
          .replace('{publishDate}', audit.publishDate.toLocaleString())
          .replace('{closeDate}', audit.closeDate.toLocaleString())
          .replace('{supplier.name}', supplier.basicInfo.enName);
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

      // send notification ==============
      let kind = 'supplier__failed';

      if (response.isQualified) {
        if (improvementPlan) {
          kind = 'supplier__approved_with_improvement_plan';
        } else {
          kind = 'supplier__approved';
        }
      }

      await sendEmail({ kind, toEmails: [company.basicInfo.email], attachments });

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
