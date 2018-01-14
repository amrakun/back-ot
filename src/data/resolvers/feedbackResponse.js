import { Companies } from '../../db/models';

export default {
  supplier(feedbackResponse) {
    return Companies.findOne({ _id: feedbackResponse.supplierId });
  },
};
