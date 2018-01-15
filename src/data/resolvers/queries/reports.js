import { Companies } from '../../../db/models';

const reportsSuppliersQuery = {
  async reportsSuppliers(root, { dateInterval, affiliation, sectCodes, statuses }) {
    return Companies.find({});
  },
};

export default reportsSuppliersQuery;
