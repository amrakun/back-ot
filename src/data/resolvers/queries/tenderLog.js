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
};

requireBuyer(tenderLogQuery, 'tenderLog');

export default tenderLogQuery;
