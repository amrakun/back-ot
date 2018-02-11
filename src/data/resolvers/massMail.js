import { Companies } from '../../db/models';

export default {
  suppliers(massMail) {
    return Companies.find({ _id: { $in: massMail.supplierIds } });
  },
};
