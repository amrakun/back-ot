import { TenderMessages } from '../../../db/models';

import { requireSupplier, requireBuyer } from '../../permissions';

const tenderMessageMutations = {
  async tenderMessageBuyerSend(parent, args, { user }) {
    return TenderMessages.tenderMessageBuyerSend(args, user);
  },

  async tenderMessageSupplierSend(parent, args, { user }) {
    return TenderMessages.tenderMessageSupplierSend(args, user);
  },

  async tenderMessageSetAsRead(parent, args, { user }) {
    return TenderMessages.tenderMessageSetAsRead(args, user);
  },
};

requireBuyer(tenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(tenderMessageMutations, 'tenderMessageSupplierSend');

export default tenderMessageMutations;
