import { BlockedCompanies } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const blockedCompanyQueries = {
  /**
   * BlockedCompanies list
   */
  blockedCompanies() {
    return BlockedCompanies.find({});
  },
};

moduleRequireBuyer(blockedCompanyQueries);

export default blockedCompanyQueries;
