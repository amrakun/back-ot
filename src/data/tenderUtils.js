import utils from './utils';
import { Users, Companies } from '../db/models';

export const replacer = ({ text, tender }) => {
  let result = text;

  result = result.replace(/{tender.number}/g, tender.number);
  result = result.replace(/{tender.name}/g, tender.name);
  result = result.replace(/{now}/g, new Date());

  return result;
};

export const sendEmailToSuppliers = async ({ kind, tender }) => {
  const suppliers = await Companies.find({ _id: { $in: tender.supplierIds } });

  for (const supplier of suppliers) {
    await utils.sendConfigEmail({
      name: `${tender.type}Templates`,
      kind,
      toEmails: [supplier.basicInfo.email],
      replacer: text => {
        return replacer({ text, tender });
      },
    });
  }
};

export const sendEmailToBuyer = async ({ kind, tender }) => {
  const createdUser = await Users.findOne({ _id: tender.createdUserId });

  return utils.sendConfigEmail({
    name: `${tender.type}Templates`,
    kind,
    toEmails: [createdUser.email],
    replacer: text => {
      return replacer({ text, tender });
    },
  });
};

export const sendEmail = async ({ kind, tender }) => {
  await sendEmailToBuyer({
    kind: `buyer__${kind}`,
    tender,
  });

  await sendEmailToSuppliers({
    kind: `supplier__${kind}`,
    tender,
  });
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
