import { BlockedCompanies } from '../../../db/models';

const blockedCompanyQueries = {
  /**
   * BlockedCompanies list
   */
  blockedCompanies() {
    return BlockedCompanies.find({});
  },
};

export default blockedCompanyQueries;
