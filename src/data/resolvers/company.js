import { Tenders, Feedbacks } from '../../db/models';

export default {
  tenders(company) {
    return Tenders.find({ supplierIds: { $in: company._id } });
  },

  lastDifotScore(company) {
    return company.getLastDifotScore();
  },

  lastDueDiligence(company) {
    return company.getLastDueDiligence();
  },

  feedbacks(company) {
    return Feedbacks.find({ supplierIds: { $in: [company._id] } });
  },
};
