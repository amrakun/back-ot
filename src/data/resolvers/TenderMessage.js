import { Users, Tenders } from '../../db/models';

export default {
  tender({ tenderId }) {
    return Tenders.findOne({ _id: tenderId });
  },

  senderBuyer({ senderBuyerId }) {
    return Users.findOne({ _id: senderBuyerId });
  },

  recipientSuppliers({ recipientSupplierIds }) {
    return Users.find({ _id: { $in: recipientSupplierIds } });
  },

  senderSupplier({ senderSupplierId }) {
    return Users.findOne({ _id: senderSupplierId });
  },
};
