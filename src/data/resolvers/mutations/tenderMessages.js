import { TenderMessages, Tenders, Users } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmailToSuppliers, replacer } from '../../tenderUtils';
import { sendConfigEmail } from '../../utils';

const tenderMessageMutations = {
  async tenderMessageBuyerSend(root, args, { user }) {
    const tenderMessage = await TenderMessages.tenderMessageBuyerSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    const supplierIds = args.recipientSupplierIds;

    await sendEmailToSuppliers({
      kind: 'supplier__message_notification',
      tender,
      supplierIds,
    });

    return tenderMessage;
  },

  async tenderMessageSupplierSend(root, args, { user }) {
    const tenderMessage = await TenderMessages.tenderMessageSupplierSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    const buyer = await Users.findOne({ _id: tenderMessage.senderBuyerId });

    await sendConfigEmail({
      name: `${tender.type}Templates`,
      kind: 'buyer__message_notification',
      toEmails: [buyer.email],
      replacer: text => {
        return replacer({ text, tender });
      },
    });

    return tenderMessage;
  },

  async tenderMessageSetAsRead(root, args, { user }) {
    return TenderMessages.tenderMessageSetAsRead(args, user);
  },
};

requireBuyer(tenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(tenderMessageMutations, 'tenderMessageSupplierSend');

export default tenderMessageMutations;
