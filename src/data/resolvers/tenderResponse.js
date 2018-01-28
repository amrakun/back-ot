import { Companies } from '../../db/models';

export default {
  supplier(tenderResponse) {
    return Companies.findOne({ _id: tenderResponse.supplierId });
  },
};
