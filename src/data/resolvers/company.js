import { Tenders } from '../../db/models';

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
    return company.getFeedbacks();
  },

  lastFeedback(company) {
    return company.getLastFeedback();
  },
};
