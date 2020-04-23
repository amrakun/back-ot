import { Companies, Audits, AuditResponses } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmail } from '../../../data/auditUtils';
import { sendConfigEmail, putCreateLog, putUpdateLog, putDeleteLog } from '../../../data/utils';
import { readS3File } from '../../../data/utils';
import { LOG_TYPES } from '../../constants';

const auditMutations = {
  // create new audit
  async auditsAdd(root, args, { user }) {
    const audit = await Audits.createAudit(args, user._id);

    putCreateLog(
      {
        type: LOG_TYPES.DESKTOP_AUDIT,
        object: audit,
        newData: JSON.stringify(audit),
        description: 'Created desktop audit',
      },
      user,
    );

    return audit;
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

  async auditsBuyerCancelResponse(root, { responseId }, { user }) {
    const response = await AuditResponses.findOne({
      _id: responseId,
    });

    if (!response) {
      throw new Error('Not found');
    }

    const audit = await Audits.findOne({ _id: response.auditId });

    if (audit.status === 'closed') {
      throw new Error('Closed');
    }

    const supplier = await Companies.findOne({ _id: response.supplierId });
    const basicInfo = supplier.basicInfo || {};
    const contactInfo = supplier.contactInfo || {};

    if (audit.status === 'open') {
      // send email to supplier ===================
      sendEmail({
        kind: 'supplier__cancel',
        toEmails: [contactInfo.email],
        supplier,
        audit,
      });

      // send email to buyer ===================
      sendEmail({
        kind: 'buyer__cancel',
        toEmails: [process.env.MAIN_AUDITOR_EMAIL],
        supplier,
        audit,
      });
    }

    putDeleteLog(
      {
        type: LOG_TYPES.DESKTOP_AUDIT,
        object: response,
        description: `Canceled audit response of "${basicInfo.enName}"`,
      },
      user,
    );

    await AuditResponses.remove({ _id: responseId });

    return 'canceled';
  },

  async auditsBuyerNotificationMarkAsRead(root, { responseId }) {
    return AuditResponses.markAsBuyerNotified(responseId);
  },

  async auditsSupplierSendResubmitRequest(root, { description }, { user }) {
    const company = await Companies.findOne({ _id: user.companyId });

    await AuditResponses.saveResubmitRequest({ supplierId: user.companyId, description });

    const basicInfo = company.basicInfo || {};

    // send notification email to buyer
    const { MAIN_AUDITOR_EMAIL } = process.env;

    await sendConfigEmail({
      name: 'desktopAuditTemplates',
      kind: 'supplier__send_resubmission_request',
      toEmails: [MAIN_AUDITOR_EMAIL],
      replacer: text => {
        return text
          .replace('{supplier.name}', basicInfo.enName)
          .replace('{supplier._id}', company._id)
          .replace('{description}', description);
      },
    });

    putCreateLog(
      {
        type: LOG_TYPES.DESKTOP_AUDIT,
        object: { description },
        newData: JSON.stringify({ description }),
        description: `"${basicInfo.enName}" sent audit resubmission request`,
      },
      user,
    );

    return 'received';
  },

  async auditsBuyerToggleState(root, { supplierId, editableDate }, { user }) {
    const company = await Companies.getCompany({ _id: supplierId });
    const basicInfo = company.basicInfo || {};

    const { oldResponse, updatedResponse } = await AuditResponses.toggleState(
      supplierId,
      editableDate,
    );

    if (updatedResponse.isEditable) {
      await sendConfigEmail({
        name: 'desktopAuditTemplates',
        kind: 'supplier__enable',
        toEmails: [basicInfo.email],
        replacer: text => {
          return text
            .replace('{supplier.name}', basicInfo.enName)
            .replace('{supplier._id}', company._id);
        },
      });
    }

    putUpdateLog(
      {
        type: LOG_TYPES.DESKTOP_AUDIT,
        object: oldResponse,
        newData: updatedResponse,
        description: `Audit state of company "${basicInfo.enName}" has been toggled`,
      },
      user,
    );

    return updatedResponse;
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
requireBuyer(auditMutations, 'auditsBuyerSendFiles');
requireBuyer(auditMutations, 'auditsBuyerToggleState');
requireBuyer(auditMutations, 'auditsBuyerCancelResponse');
requireBuyer(auditMutations, 'auditsBuyerNotificationMarkAsRead');

requireSupplier(auditMutations, 'auditsSupplierSaveBasicInfo');
requireSupplier(auditMutations, 'auditsSupplierSendResponse');
requireSupplier(auditMutations, 'auditsSupplierSendResubmitRequest');

export default auditMutations;
