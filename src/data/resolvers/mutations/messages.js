import { Messages } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';

const tenderMessageMutations = {
  async tenderMessageBuyerSend(parent, args, { user }) {
    return Messages.create({
      ...args,
      senderBuyerId: user._id,
    });
  },

  async tenderMessageSupplierSend(parent, args, { user }) {
    return Messages.create({
      ...args,
      senderSupplierId: user._id,
    });
  },
};

requireBuyer(tenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(tenderMessageMutations, 'tenderMessageSupplierSend');

export default tenderMessageMutations;
