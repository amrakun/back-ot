import { TenderMessages, Tenders } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';
import { sendEmailToSuppliers, sendEmailToBuyer } from '../../tenderUtils';

//supplier__message__notification
//buyer__message__notification

const tenderMessageMutations = {
  async tenderMessageBuyerSend(parent, args, { user }) {
    const p = await TenderMessages.tenderMessageBuyerSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    const supplierIds = args.recipientSupplierIds;
    try {
      await sendEmailToSuppliers({
        kind: 'message__notification',
        tender,
        supplierIds,
      });
    } catch (e) {
      console.log(e);
    }

    return p;
  },

  async tenderMessageSupplierSend(parent, args, { user }) {
    const p = await TenderMessages.tenderMessageSupplierSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    try {
      await sendEmailToBuyer({ kind: 'message__notification', tender });
    } catch (e) {
      console.log(e);
    }
    return p;
  },

  async tenderMessageSetAsRead(parent, args, { user }) {
    return TenderMessages.tenderMessageSetAsRead(args, user);
  },
};

requireBuyer(tenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(tenderMessageMutations, 'tenderMessageSupplierSend');

export default tenderMessageMutations;
