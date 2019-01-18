import { TenderMessages } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const TenderMessageQuery = {
  async tenderMessages(root, { tenderId = false, page = 1, perPage = 20 }, { user }) {
    const query = {};

    if (user.isSupplier) {
      if (!tenderId) {
        throw new Error('Please choose tender');
      }
      query.$or = [
        {
          recipientSupplierIds: user.companyId,
        },
        {
          senderSupplierId: user.companyId,
        },
      ];
    }

    if (tenderId) {
      query.tenderId = tenderId;
    }

    const docs = await TenderMessages.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    console.log(query);
    return docs;
  },
  async tenderMessageDetail(root, { _id }, { user }) {
    return TenderMessages.findOne({
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
