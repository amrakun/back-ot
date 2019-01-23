import { TenderMessages } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';

const TenderMessageMutations = {
  async tenderMessageBuyerSend(parent, args, { user }) {
    return TenderMessages.create({
      ...args,
      senderBuyerId: user._id,
    });
  },

  async tenderMessageSupplierSend(parent, args, { user }) {
    return TenderMessages.create({
      ...args,
      senderSupplierId: user.companyId,
    });
  },

  async tenderMessageSetAsRead(parent, { _id }, { user }) {
    const query = { _id };

    if (user.isSupplier) {
      query.recipientSupplierIds = user.companyId;
    }
    await TenderMessages.update(query, { $set: { isRead: true } });
    return TenderMessages.findOne(query);
  },
};

requireBuyer(TenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(TenderMessageMutations, 'tenderMessageSupplierSend');

export default TenderMessageMutations;
