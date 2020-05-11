import { sendConfigEmail } from './utils';

export const sendEmail = async ({ kind, toEmails, supplier, audit, attachments }) => {
  const basicInfo = (supplier && supplier.basicInfo) || {};

  return sendConfigEmail({
    name: 'desktopAuditTemplates',
    kind,
    toEmails,
    attachments,
    replacer: text => {
      return text
        .replace(/{publishDate}/g, audit.publishDate.toLocaleString())
        .replace(/{closeDate}/g, audit.closeDate.toLocaleString())
        .replace(/{supplier.name}/g, basicInfo.enName)
        .replace(/{content}/g, audit.content);
    },
  });
};
