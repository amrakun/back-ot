import { Users, TenderResponses, Companies } from '../../db/models';
import { relativeTimeThreshold } from 'moment';

export default {
  createdUser(tender) {
    return Users.findOne({ _id: tender.createdUserId });
  },

  isAwarded(tender) {
    return tender.winnerIds && tender.winnerIds.length > 0;
  },

  supplierIds(tender) {
    return tender.getAllPossibleSupplierIds();
  },

  winnerIds(tender) {
    return tender.getWinnerIds();
  },

  async suppliers(tender) {
    const ids = await tender.getAllPossibleSupplierIds();
    return Companies.find({ _id: { $in: ids } });
  },

  notBidderListedSuppliers(tender) {
    return tender.getNotBidderListedSuppliers();
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
