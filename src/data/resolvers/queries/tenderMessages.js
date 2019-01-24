import { TenderMessages, Tenders } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const tenderMessageQuery = {
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

    return docs;
  },

  async tenderMessageDetail(root, { _id }, { user }) {
    const query = { _id };

    if (user.isSupplier) {
      query.$or = [{ recipientSupplierIds: user.companyId }, { senderSupplierId: user.companyId }];
    }

    return TenderMessages.findOne(query);
  },

  async tenderMessageTotalCount(root, { tenderId }, { user }) {
    const tender = await Tenders.findOne({ _id: tenderId });

    if (!tender.getSupplierIds().includes(user.companyId)) {
      throw new Error('Permission denied');
    }

    const query = {};

    if (tenderId) query.tenderId = tenderId;

    if (user.isSupplier) {
      query.$or = [];
    }

    return TenderMessages.find(query).count();
  },
};

moduleRequireLogin(tenderMessageQuery);

export default tenderMessageQuery;
