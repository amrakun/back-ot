import { PhysicalAudits } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const physicalAuditQueries = {
  /**
   * PhysicalAudits list
   */
  physicalAudits() {
    return PhysicalAudits.find({});
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
