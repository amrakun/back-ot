import { TenderMessage } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const TenderMessageQuery = {
  async tenderMessages(root, { tenderId, page = 1, perPage = 20 }, { user }) {
    const docs = TenderMessage.find({
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
    return TenderMessage.findOne({
      _id,
      $or: [
        { senderBuyerId: user._id },
        { recipientSupplierIds: user._id },
        { senderSupplierId: user._id },
      ],
    });
  },
};

moduleRequireLogin(TenderMessageQuery);

export default TenderMessageQuery;
