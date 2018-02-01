import { PhysicalAudits } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';
import { supplierFilter } from './utils';

const physicalAuditQueries = {
  /**
   * PhysicalAudits list
   */
  async physicalAudits(root, { supplierSearch }) {
    const query = await supplierFilter({}, supplierSearch);

    return PhysicalAudits.find(query);
  },

  /**
   * PhysicalAudit detail
   */
  physicalAuditDetail(root, { _id }) {
    return PhysicalAudits.findOne({ _id });
  },
};

moduleRequireBuyer(physicalAuditQueries);

export default physicalAuditQueries;
