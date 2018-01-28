import { TenderResponses } from '../../db/models';

export default {
  async isParticipated(tender, args, { user }) {
    const supplierId = user.companyId;

    const count = await TenderResponses.count({ tenderId: tender._id, supplierId });

    return count > 0;
  },

  async isSent(tender, args, { user }) {
    const supplierId = user.companyId;

    const response = await TenderResponses.findOne({ tenderId: tender._id, supplierId });

    if (response) {
      return response.isSent;
    }

    return false;
  },
};
