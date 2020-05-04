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
        .replace('{publishDate}', audit.publishDate.toLocaleString())
        .replace('{closeDate}', audit.closeDate.toLocaleString())
        .replace('{supplier.name}', basicInfo.enName)
        .replace('{content}', audit.content);
    },
  });
};
