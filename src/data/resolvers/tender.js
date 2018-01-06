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
