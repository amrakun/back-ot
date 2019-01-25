import { TenderLog } from '../../../db/models';

import { requireBuyer } from '../../permissions';

const tenderLogQuery = {
  async tenderLog(root, { tenderId, page = 1, perPage = 20 }) {
    const query = {};

    if (tenderId) {
      query.tenderId = tenderId;
    }

    const docs = await TenderLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return docs;
  },

  async tenderLogDetail(parent, { _id }) {
    return TenderLog.findOne({ _id });
  },

  async tenderLogCount(parent, { tenderId }) {
    return TenderLog.find({ tenderId }).count();
  },
};

requireBuyer(tenderLogQuery, 'tenderLog', 'tenderLogDetail', 'tenderLogCount');

export default tenderLogQuery;
