import { Companies } from '../../db/models';

export default {
  async specificPrequalificationDow(config) {
    const { specificPrequalificationDow } = config;

    if (!specificPrequalificationDow) {
      return specificPrequalificationDow;
    }

    const { supplierIds } = specificPrequalificationDow;

    if (!supplierIds) {
      return specificPrequalificationDow;
    }

    const suppliers = await Companies.find({ _id: { $in: supplierIds } });

    return {
      ...specificPrequalificationDow,
      suppliers,
    };
  },

  async specificAuditDow(config) {
    const { specificAuditDow } = config;

    if (!specificAuditDow) {
      return specificAuditDow;
    }

    const { supplierIds } = specificAuditDow;

    if (!supplierIds) {
      return specificAuditDow;
    }

    const suppliers = await Companies.find({ _id: { $in: supplierIds } });

    return {
      ...specificAuditDow,
      suppliers,
    };
  },
};
