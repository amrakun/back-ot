import { TenderMessages, Tenders, Users } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmailToSuppliers, sendEmailToBuyer } from '../../tenderUtils';

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
    const buyers = await Users.find({ _id: { $in: tender.responsibleBuyerIds || [] } });

    await sendEmailToBuyer({
      kind: 'buyer__message_notification',
      tender,
      extraBuyerEmails: buyers.map(buyer => buyer.email),
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
