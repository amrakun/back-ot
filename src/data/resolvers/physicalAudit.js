import { Users, Companies } from '../../db/models';

export default {
  createdUser(physicalAudit) {
    return Users.findOne({ _id: physicalAudit.createdUserId });
  },

  supplier(physicalAudit) {
    return Companies.findOne({ _id: physicalAudit.supplierId });
  },
};
