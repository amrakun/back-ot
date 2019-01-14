import { TenderMessageModel } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const TenderMessage = {
  async tenderMessages(root, { tenderId, page = 1, perPage = 20 }, { user }) {
    const docs = TenderMessageModel.find({
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
  async tenderMessageDetail(root, { _id }, { user }) {
    return TenderMessageModel.findOne({
      _id,
      $or: [
        { senderBuyerId: user._id },
        { recipientSupplierIds: user._id },
        { senderSupplierId: user._id },
      ],
    });
  },
};

moduleRequireLogin(TenderMessage);

export default TenderMessage;
