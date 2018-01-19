import { Companies } from '../../db/models';

export default {
  supplier(auditResponse) {
    return Companies.findOne({ _id: auditResponse.supplierId });
  },
};
