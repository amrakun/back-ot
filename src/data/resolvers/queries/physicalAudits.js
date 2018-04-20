import { PhysicalAudits } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';
import { supplierFilter, paginate } from './utils';

const physicalAuditQueries = {
  /**
   * PhysicalAudits list
   */
  async physicalAudits(root, args) {
    const query = await supplierFilter({}, args.supplierSearch);

    return paginate(PhysicalAudits.find(query), args);
  },

  /**
   * PhysicalAudits total count
   */
  async totalPhysicalAudits(root, { supplierSearch }) {
    const query = await supplierFilter({}, supplierSearch);

    return PhysicalAudits.find(query).count();
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
