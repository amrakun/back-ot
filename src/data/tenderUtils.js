import utils from './utils';
import { Users, Companies } from '../db/models';

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

export const sendEmailToSuppliers = async ({ kind, tender, supplierIds }) => {
  const filterIds = supplierIds || tender.getSupplierIds();

  const suppliers = await Companies.find({ _id: { $in: filterIds } });

  const attachments = (tender.attachments || []).map(attachment => ({
    filename: attachment.name,
    path: attachment.url,
  }));

  for (const supplier of suppliers) {
    await utils.sendConfigEmail({
      name: `${tender.type}Templates`,
      kind,
      toEmails: [supplier.basicInfo.email],
      attachments,
      replacer: text => {
        return replacer({ text, tender });
      },
    });
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

export const sendEmail = async ({ kind, tender, extraBuyerEmails = [] }) => {
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
      tender,
    });
  } catch (e) {
    console.log(e); // eslint-disable-line
  }
};

export const sendConfigEmail = async ({ kind, tender, toEmails }) => {
  return utils.sendConfigEmail({
    name: `${tender.type}Templates`,
    kind,
    toEmails,
    replacer: text => {
      return replacer({ text, tender });
    },
  });
};
