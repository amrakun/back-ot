import { TenderMessages } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';

const TenderMessage = {
  async tenderMessageBuyerSend(parent, args, { user }) {
    return TenderMessages.create({
      ...args,
      senderBuyerId: user._id,
    });
  },

  async tenderMessageSupplierSend(parent, args, { user }) {
    return TenderMessages.create({
      ...args,
      senderSupplierId: user._id,
    });
  },
};

requireBuyer(TenderMessage, 'tenderMessageBuyerSend');
requireSupplier(TenderMessage, 'tenderMessageSupplierSend');

export default TenderMessage;
