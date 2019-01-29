import { TenderMessages, Tenders } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmailToSuppliers, sendEmailToBuyer } from '../../tenderUtils';

const tenderMessageMutations = {
  async tenderMessageBuyerSend(parent, args, { user }) {
    const p = await TenderMessages.tenderMessageBuyerSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    const supplierIds = args.recipientSupplierIds;
    await sendEmailToSuppliers({
      kind: 'supplier__message_notification',
      tender,
      supplierIds,
    });

    return p;
  },

  async tenderMessageSupplierSend(parent, args, { user }) {
    const p = await TenderMessages.tenderMessageSupplierSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    await sendEmailToBuyer({ kind: 'buyer__message_notification', tender });
    return p;
  },

  async tenderMessageSetAsRead(parent, args, { user }) {
    return TenderMessages.tenderMessageSetAsRead(args, user);
  },
};

requireBuyer(tenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(tenderMessageMutations, 'tenderMessageSupplierSend');

export default tenderMessageMutations;
