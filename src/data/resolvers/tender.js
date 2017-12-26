import { TenderResponses, Companies } from '../../db/models';

export default {
  suppliers(tender) {
    return Companies.find({ _id: { $in: tender.supplierIds } });
  },

  submittedCount(tender) {
    return TenderResponses.find({ tenderId: tender._id }).count();
  },
};
