import { Users, Tenders, Companies, TenderMessages } from '../../db/models';

const findRelatedMessages = async (message, totalMessages) => {
  if (message.replyToId) {
    const parentMessage = await TenderMessages.findOne({ _id: message.replyToId });

    totalMessages.push(parentMessage);

    return findRelatedMessages(parentMessage, totalMessages);
  }

  return message;
};

export default {
  tender({ tenderId }) {
    return Tenders.findOne({ _id: tenderId });
  },

  senderBuyer({ senderBuyerId }) {
    return Users.findOne({ _id: senderBuyerId });
  },

  recipientSuppliers({ recipientSupplierIds }, {}, { user }) {
    if (user.isSupplier) {
      return Companies.find({ _id: user.companyId });
    }

    return Companies.find({ _id: { $in: recipientSupplierIds } });
  },

  senderSupplier({ senderSupplierId }) {
    return Companies.findOne({ _id: senderSupplierId });
  },

  replyTo({ replyToId }) {
    return TenderMessages.findOne({ _id: replyToId });
  },

  async relatedMessages(message) {
    const relatedMessages = [];

    const rootMessage = await findRelatedMessages(message, relatedMessages);

    return {
      rootMessage,
      list: relatedMessages,
    };
  },
};
