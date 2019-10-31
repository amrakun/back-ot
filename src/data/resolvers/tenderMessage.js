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

  isRead(message, {}, { user }) {
    const userId = user._id.toString();

    if (message.senderBuyerId === userId || message.senderSupplierId === user.companyId) {
      return true;
    }

    // TODO: Remove this check after removing isRead field
    if (message.isRead) {
      return true;
    }

    if ((message.readUserIds || []).includes(userId)) {
      return true;
    }

    return false;
  },

  async relatedMessages(message, {}, { user }) {
    const relatedMessages = [];

    const rootMessage = await findRelatedMessages(message, relatedMessages);

    const selector = {
      replyToId: rootMessage._id,
      _id: { $ne: message._id },
      createdAt: { $lte: message.createdAt },
    };

    if (user.isSupplier) {
      selector.senderSupplierId = user.supplierId;
    } else {
      selector.senderBuyerId = message.senderBuyerId;
      selector.senderSupplierId = message.senderSupplierId;
    }

    const siblings = await TenderMessages.find(selector).sort({ createdAt: -1 });

    return {
      rootMessage,
      list: [...siblings, ...relatedMessages],
    };
  },
};
