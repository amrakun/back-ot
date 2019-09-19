import JSZip from 'jszip';
import utils from './utils';
import {
  Users,
  Companies,
  TenderResponses,
  Tenders,
  TenderMessages,
  BlockedCompanies,
} from '../db/models';

export const replacer = ({ text, tender }) => {
  let result = text;

  result = result.replace(/{tender.id}/g, tender._id);
  result = result.replace(/{tender.content}/g, tender.content);
  result = result.replace(/{tender.number}/g, tender.number);
  result = result.replace(/{tender.name}/g, tender.name);
  result = result.replace(/{tender.cancelReason}/g, tender.cancelReason);
  result = result.replace(/{tender.closeDate}/g, tender.closeDate.toLocaleString());
  result = result.replace(/{tender.publishDate}/g, tender.publishDate.toLocaleString());
  result = result.replace(/{now}/g, new Date().toLocaleString());

  return result;
};

/*
 * Send tender email to suppliers
 */
export const sendEmailToSuppliers = async ({ kind, tender, supplierIds, attachments }) => {
  const filterIds = supplierIds || (await tender.getAllPossibleSupplierIds());

  // preparing blocked suppliers cache =================
  const suppliers = await Companies.find(
    { _id: { $in: filterIds } },
    { _id: 1, contactInfo: 1 },
  ).lean();

  const blockedSuppliers = await BlockedCompanies.find(
    { supplierId: { $in: filterIds }, ...BlockedCompanies.blockedRangeQuery() },
    { supplierId: 1 },
  ).lean();

  const blockedSupplierIds = blockedSuppliers.map(bl => bl.supplierId);

  // preparing users cache =============================
  const users = await Users.find({ companyId: { $in: filterIds } }, { companyId: 1, email: 1 });
  const userEmailsByCompanyId = {};

  for (const user of users) {
    userEmailsByCompanyId[user.companyId] = user.email;
  }

  const receivers = [];

  for (const supplier of suppliers) {
    if (blockedSupplierIds.includes(supplier._id.toString())) {
      continue;
    }

    const userEmail = userEmailsByCompanyId[supplier._id];

    receivers.push(userEmail);

    const { contactInfo } = supplier;

    if (contactInfo && contactInfo.email && contactInfo.email !== userEmail) {
      receivers.push(contactInfo.email);
    }
  }

  utils
    .sendConfigEmail({
      name: `${tender.type}Templates`,
      kind,
      attachments,
      replacer: text => {
        return replacer({ text, tender });
      },
      toEmails: receivers,
    })
    .then(() => {
      console.log('Success');
    })
    .catch(e => {
      console.log(e);
    });

  return receivers;
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

const generateFileName = name => {
  const random = Math.random();
  return `${random}-${(name || '').replace(/\//g, ' ')}`;
};

/*
 * Download tender supplier responded files
 */
export const downloadFiles = async (tenderId, user) => {
  const tender = await Tenders.findOne({ _id: tenderId });

  if (!tender || tender.status === 'open') {
    return Promise.reject(new Error('Invalid request'));
  }

  const responses = await TenderResponses.find({
    tenderId,
    isSent: true,
    isNotInterested: { $ne: true },
  });

  if (responses.length === 0) {
    return Promise.reject(new Error('No responses found'));
  }

  const type = tender.type;
  const zip = new JSZip();
  const attachments = zip.folder(tender.name);

  for (const response of responses) {
    const supplier = await Companies.findOne({ _id: response.supplierId });

    let filesDoc = [];

    if (type === 'eoi') {
      filesDoc = (response.respondedDocuments || []).map(document => ({
        file: document.file,
        name: document.name,
      }));
    }

    if (type === 'rfq') {
      filesDoc = (response.respondedProducts || []).map(product => ({
        file: product.file,
        name: product.code,
      }));
    }

    if (type === 'trfq') {
      filesDoc = (response.respondedFiles || []).map(file => ({
        file,
        name: 'Attachments',
      }));
    }

    if (filesDoc.length === 0) {
      continue;
    }

    const subFolderName = supplier.basicInfo.enName;
    const subFolder = attachments.folder(subFolderName);
    let filesCount = 0;

    for (const { file, name } of filesDoc) {
      if (!file) {
        continue;
      }

      const response = await utils.readS3File(file.url, user);
      const filesFolder = subFolder.folder((name || '').replace(/\//g, ' '));

      filesFolder.file(generateFileName(file.name), response.Body);

      filesCount++;
    }

    if (filesCount === 0) {
      attachments.remove(subFolderName);
    }
  }

  return zip.generateAsync({ type: 'nodebuffer' });
};

/*
 * Download tender message files
 */
export const downloadTenderMessageFiles = async (tenderId, user) => {
  const tender = await Tenders.findOne({ _id: tenderId });

  const messages = await TenderMessages.find({
    tenderId,
    attachment: { $exists: true },
    senderSupplierId: { $exists: true },
  });

  const zip = new JSZip();
  const attachments = zip.folder(tender.name);
  const folders = {};

  for (const message of messages) {
    const { attachment, senderSupplierId } = message;
    const supplier = await Companies.findOne({ _id: senderSupplierId });

    if (!supplier || !attachment || !supplier.basicInfo || !supplier.basicInfo.enName) {
      continue;
    }

    const supplierName = supplier.basicInfo.enName;

    if (!folders[supplierName]) {
      folders[supplierName] = attachments.folder(supplierName);
    }

    // download file from s3
    const response = await utils.readS3File(attachment.url, user);

    folders[supplierName].file(generateFileName(attachment.name), response.Body);
  }

  return zip.generateAsync({ type: 'nodebuffer' });
};

/**
 * Collects list of supplier names
 * @param {string[]} supplierIds Supplier ids
 * @param {string} idFieldName Id field name defined differently in schemas
 */
const gatherSupplierNames = async (supplierIds = [], idFieldName) => {
  const supplierNames = [];

  for (const id of supplierIds) {
    const name = await Companies.getName(id);

    if (name) {
      // item must have field name declared in schemas
      supplierNames.push({
        [idFieldName]: id,
        name,
      });
    }
  }

  return supplierNames;
};

/**
 * Collects list of user names (responsibleBuyerIds)
 * @param {string[]} userIds
 */
const gatherUserNames = async (userIds = []) => {
  const names = [];

  for (const id of userIds) {
    const user = await Users.findOne({ _id: id });

    if (user) {
      names.push({
        responsibleBuyerIds: id,
        name: `${user.firstName} ${user.lastName}`,
      });
    }
  }

  return names;
};

export default {
  sendConfigEmail,
  sendEmailToSuppliers,
  sendEmailToBuyer,
  sendEmail,
  getAttachments,
  downloadFiles,
  downloadTenderMessageFiles,
  gatherSupplierNames,
  gatherUserNames,
};
