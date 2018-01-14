import { Companies } from '../../db/models';

export default {
  company(qualification) {
    return Companies.findOne({ _id: qualification.supplierId });
  },
};
