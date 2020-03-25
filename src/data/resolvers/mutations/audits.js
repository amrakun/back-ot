import { Companies, Audits, AuditResponses } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmail } from '../../../data/auditUtils';
import { readS3File } from '../../../data/utils';

const auditMutations = {
  // create new audit
  auditsAdd(root, args, { user }) {
    return Audits.createAudit(args, user._id);
  },

  // save basic info
  async auditsSupplierSaveBasicInfo(root, { auditId, basicInfo }, { user }) {
    const supplierId = user.companyId;

    const response = await AuditResponses.saveBasicInfo({
      auditId,
      supplierId,
      doc: basicInfo,
    });

    await AuditResponses.markAsSupplierNotified({ auditId, supplierId });

    return response;
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
      supplier,
      audit,
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
  async auditsBuyerSendFiles(root, { responseIds, improvementPlan, report }, { user }) {
    for (const responseId of responseIds) {
      const response = await AuditResponses.findOne({ _id: responseId });
      const audit = await Audits.findOne({ _id: response.auditId });
      const supplier = await Companies.findOne({ _id: response.supplierId });

      // collection attachments =========
      const attachments = [];

      if (improvementPlan) {
        const file = await readS3File(response.improvementPlanFile, user);

        attachments.push({
          filename: 'improvement_plan.xlsx',
          content: file.Body,
        });
      }

      if (report) {
        const file = await readS3File(response.reportFile, user);

        attachments.push({
          filename: 'report.xlsx',
          content: file.Body,
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

      await sendEmail({
        kind,
        toEmails: [supplier.basicInfo.email],
        attachments,
        audit,
        supplier,
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

  auditMutations[supplierName] = async (root, args, { user }) => {
    const auditId = args.auditId;
    const supplierId = user.companyId;

    const prevEntry = await AuditResponses.findOne({ auditId, supplierId });

    if (prevEntry && prevEntry.isEditable == false) {
      throw new Error('Not editable');
    }

    const response = await AuditResponses.saveReplyRecommentSection({
      auditId,
      supplierId,
      name: section,
      doc: args[section],
    });

    await AuditResponses.markAsSupplierNotified({ auditId, supplierId });

    return response;
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
requireSupplier(auditMutations, 'auditsSupplierSendResponse');

export default auditMutations;
