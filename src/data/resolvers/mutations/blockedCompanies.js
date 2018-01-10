import { BlockedCompanies } from '../../../db/models';

const blockedCompanyMutations = {
  async blockedCompaniesBlock(root, { supplierIds, ...doc }, { user }) {
    for (let supplierId of supplierIds) {
      await BlockedCompanies.block({ supplierId, ...doc }, user._id);
    }
  },

  async blockedCompaniesUnblock(root, { supplierIds }) {
    for (let supplierId of supplierIds) {
      await BlockedCompanies.unblock(supplierId);
    }
  },
};

export default blockedCompanyMutations;
