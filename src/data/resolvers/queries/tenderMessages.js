import { TenderMessages, Tenders } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const generateQuery = async (user, tenderId) => {
  const query = {};

  if (user.isSupplier) {
    const tender = await Tenders.findOne({ _id: tenderId });

    if (!tender) {
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

    const exactSupplierIds = await tender.getExactSupplierIds();
    const supplierIds = await tender.participatedSuppliers({ onlyIds: true });

    if (supplierIds.includes(user.companyId)) {
      query.$or.push({ eoiTargets: 'toParticipated' });
    }

    if (exactSupplierIds.includes(user.companyId)) {
      query.$or.push({ eoiTargets: 'toAll' });
    }
  }

  if (tenderId) {
    query.tenderId = tenderId;
  }

  return query;
};

const tenderMessageQuery = {
  async tenderMessages(root, { tenderId = false, page = 1, perPage = 20 }, { user }) {
    const query = await generateQuery(user, tenderId);

    const docs = await TenderMessages.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return docs;
  },

  async tenderMessageDetail(root, { _id }, { user }) {
    const message = await TenderMessages.findOne({ _id });

    const query = await generateQuery(user, message.tenderId);

    query._id = _id;

    return TenderMessages.findOne(query);
  },

  async tenderMessageTotalCount(root, { tenderId }) {
    const query = {};

    if (tenderId) query.tenderId = tenderId;

    return TenderMessages.find(query).count();
  },
};

moduleRequireLogin(tenderMessageQuery);

export default tenderMessageQuery;
