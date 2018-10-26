import { TenderResponses } from '../../db/models';
import { encrypt } from '../../db/models/utils';

export default {
  async isParticipated(tender, args, { user }) {
    const count = await TenderResponses.count({
      tenderId: tender._id,
      supplierId: encrypt(user.companyId),
    });

    return count > 0;
  },

  async isSent(tender, args, { user }) {
    const response = await TenderResponses.findOne({
      tenderId: tender._id,
      supplierId: encrypt(user.companyId),
    });

    if (response) {
      return response.isSent;
    }

    return false;
  },
};
