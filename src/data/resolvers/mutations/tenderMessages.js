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
      senderSupplierId: user._id,
    });
  },
};

requireBuyer(TenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(TenderMessageMutations, 'tenderMessageSupplierSend');

export default TenderMessageMutations;
