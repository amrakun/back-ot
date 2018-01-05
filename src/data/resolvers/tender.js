import { Users, TenderResponses, Companies } from '../../db/models';

const requestedCount = tender => {
  return tender.supplierIds.length;
};

const submittedCount = tender => {
  return TenderResponses.find({ tenderId: tender._id, isNotInterested: false }).count();
};

const notInterestedCount = tender => {
  return TenderResponses.find({ tenderId: tender._id, isNotInterested: true }).count();
};

export default {
  createdUser(tender) {
    return Users.findOne({ _id: tender.createdUserId });
  },

  isAwarded(tender) {
    return tender.winnerId;
  },

  suppliers(tender) {
    return Companies.find({ _id: { $in: tender.supplierIds } });
  },

  requestedCount(tender) {
    return requestedCount(tender);
  },

  submittedCount(tender) {
    return submittedCount(tender);
  },

  notInterestedCount(tender) {
    return notInterestedCount(tender);
  },

  async notRespondedCount(tender) {
    const respondedCount = (await submittedCount(tender)) + (await notInterestedCount(tender));

    return requestedCount(tender) - respondedCount;
  },

  async responses(tender) {
    const responses = await TenderResponses.find({ tenderId: tender._id });

    return responses.map(async response => {
      const supplier = await Companies.findOne({ _id: response.supplierId });

      return {
        supplier,
        response,
      };
    });
  },
};
