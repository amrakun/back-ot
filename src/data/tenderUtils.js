import JSZip from 'jszip';
import utils from './utils';
import { Users, Companies, TenderResponses, Tenders } from '../db/models';

export const replacer = ({ text, tender }) => {
  let result = text;

  result = result.replace(/{tender.content}/g, tender.content);
  result = result.replace(/{tender.number}/g, tender.number);
  result = result.replace(/{tender.name}/g, tender.name);
  result = result.replace(/{tender.closeDate}/g, tender.closeDate.toLocaleString());
  result = result.replace(/{tender.publishDate}/g, tender.publishDate.toLocaleString());
  result = result.replace(/{now}/g, new Date().toLocaleString());

  return result;
};

export const sendEmailToSuppliers = async ({ kind, tender, supplierIds, attachments }) => {
  const filterIds = supplierIds || (await tender.getAllPossibleSupplierIds());

  const suppliers = await Companies.find({ _id: { $in: filterIds } });

  for (const supplier of suppliers) {
    const user = await Users.findOne({ companyId: supplier._id });

    const options = {
      name: `${tender.type}Templates`,
      kind,
      attachments,
      replacer: text => {
        return replacer({ text, tender });
      },
    };

    await utils.sendConfigEmail({
      ...options,
      toEmails: [user.email],
    });

    const { basicInfo } = supplier;

    if (basicInfo && basicInfo.email && basicInfo.email !== user.email) {
      await utils.sendConfigEmail({
        ...options,
        toEmails: [basicInfo.email],
      });
    }
  }
};

export const sendEmailToBuyer = async ({ kind, tender, extraBuyerEmails = [] }) => {
  const createdUser = await Users.findOne({ _id: tender.createdUserId });

  return utils.sendConfigEmail({
    name: `${tender.type}Templates`,
    kind,
    toEmails: [...extraBuyerEmails, createdUser.email],
    replacer: text => {
      return replacer({ text, tender });
    },
  });
};

export const sendEmail = async ({ kind, tender, attachments = [], extraBuyerEmails = [] }) => {
  try {
    await sendEmailToBuyer({
      kind: `buyer__${kind}`,
      tender,
      extraBuyerEmails,
    });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }

  try {
    await sendEmailToSuppliers({
      kind: `supplier__${kind}`,
      attachments,
      tender,
    });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
};

export const sendConfigEmail = async ({ kind, tender, toEmails, attachments }) => {
  return utils.sendConfigEmail({
    name: `${tender.type}Templates`,
    kind,
    toEmails,
    attachments,
    replacer: text => {
      return replacer({ text, tender });
    },
  });
};

export const getAttachments = async tender => {
  const attachments = [];

  for (const attachment of tender.attachments || []) {
    const file = await utils.readS3File(attachment.url, 'system');

    attachments.push({
      filename: attachment.name,
      content: file.Body,
    });
  }

  return attachments;
};

/*
 * Download eoi supplier responded files
 */
export const downloadFiles = async (tenderId, user) => {
  const tender = await Tenders.findOne({ _id: tenderId });

  if (!tender || tender.status === 'open' || tender.type !== 'eoi') {
    return Promise.resolve(null);
  }

  const zip = new JSZip();
  const attachments = zip.folder('files');

  const responses = await TenderResponses.find({ tenderId, isSent: true, isNotInterested: { $ne: true } });

  for (const response of responses) {
    const supplier = await Companies.findOne({ _id: response.supplierId });
    const documents = response.respondedDocuments || [];

    if (documents.length === 0) {
      continue;
    }

    const subFolder = attachments.folder(supplier.basicInfo.enName);

    for (const document of documents) {
      const { file } = document;

      if (!file) {
        continue;
      }

      const response = await utils.readS3File(file.url, user);
      const documentFolder = subFolder.folder(document.name);

      documentFolder.file(file.name, response.Body);
    }
  }

  return zip.generateAsync({ type: 'nodebuffer' });
}

export default {
  sendConfigEmail,
  sendEmailToSuppliers,
  sendEmailToBuyer,
  sendEmail,
  getAttachments,
  downloadFiles
};
