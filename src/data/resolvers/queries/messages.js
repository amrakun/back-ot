import { Messages } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const messageQueries = {
  async tenderMessages(root, { tenderId, page = 1, perPage = 20 }, { user }) {
    const docs = Messages.find({
      tenderId,
      $or: [
        { senderBuyerId: user._id },
        { recipientSupplierIds: user._id },
        { senderSupplierId: user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return docs;
  },
  tenderMessageDetail(root, { _id }, { user }) {
    return Messages.findOne({
      _id,
      $or: [
        { senderBuyerId: user._id },
        { recipientSupplierIds: user._id },
        { senderSupplierId: user._id },
      ],
    });
  },
};

moduleRequireLogin(messageQueries);

export default messageQueries;
