import { Users, Companies } from '../../db/models';

export default {
  createdUser(blockedCompany) {
    return Users.findOne({ _id: blockedCompany.createdUserId });
  },

  supplier(blockedCompany) {
    return Companies.findOne({ _id: blockedCompany.supplierId });
  },
};
