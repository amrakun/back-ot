import { Companies } from '../../db/models';

const dataWithSuppliers = async (config, name) => {
  const dow = config[name];

  if (!dow) {
    return dow;
  }

  const { supplierIds } = dow;

  if (!supplierIds) {
    return dow;
  }

  const suppliers = await Companies.find({ _id: { $in: supplierIds } });

  return {
    ...dow.toJSON(),
    suppliers,
  };
};

export default {
  specificPrequalificationDow(config) {
    return dataWithSuppliers(config, 'specificPrequalificationDow');
  },

  specificDueDiligenceDow(config) {
    return dataWithSuppliers(config, 'specificDueDiligenceDow');
  },

  async specificAuditDow(config) {
    return dataWithSuppliers(config, 'specificAuditDow');
  },
};
