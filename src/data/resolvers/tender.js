import { TenderResponses, Companies } from '../../db/models';

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
};
