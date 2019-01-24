import { Users, Tenders, Companies, TenderMessages } from '../../db/models';

export default {
  tender({ tenderId }) {
    return Tenders.findOne({ _id: tenderId });
  },

  senderBuyer({ senderBuyerId }) {
    return Users.findOne({ _id: senderBuyerId });
  },

  recipientSuppliers({ recipientSupplierIds }) {
    return Companies.find({ _id: { $in: recipientSupplierIds } });
  },

  senderSupplier({ senderSupplierId }) {
    return Companies.findOne({ _id: senderSupplierId });
  },
  replyTo({ replyToId }) {
    return TenderMessages.findOne({ _id: replyToId });
  },
};
