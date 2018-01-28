import { Users, TenderResponses, Companies } from '../../db/models';

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
    return tender.requestedCount();
  },

  submittedCount(tender) {
    return tender.submittedCount();
  },

  notInterestedCount(tender) {
    return tender.notInterestedCount();
  },

  notRespondedCount(tender) {
    return tender.notRespondedCount();
  },

  responses(tender) {
    return TenderResponses.find({ tenderId: tender._id, isSent: true });
  },
};
