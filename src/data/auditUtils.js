import { Companies } from '../db/models';
import { sendConfigEmail } from './utils';

export const sendEmail = async ({ kind, toEmails, supplierId, attachments }) => {
  const supplier = await Companies.findOne({ _id: supplierId });

  return sendConfigEmail({
    name: 'desktopAuditTemplates',
    kind,
    toEmails,
    attachments,
    replacer: text => {
      if (supplier) {
        return text.replace('{supplier.name}', supplier.basicInfo.enName);
      }

      return text;
    },
  });
};

export const sendEmailToSupplier = async ({ kind, supplierId, attachments }) => {
  const supplier = await Companies.findOne({ _id: supplierId });

  return sendEmail({
    kind,
    toEmails: [supplier.basicInfo.email],
    attachments,
    supplierId,
  });
};
