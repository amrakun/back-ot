import { Companies } from '../../db/models';

export default {
  async suppliers(tender) {
    return Companies.find({ _id: { $in: tender.supplierIds } });
  },
};
