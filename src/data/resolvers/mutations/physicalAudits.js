import { PhysicalAudits } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const physicalAuditMutations = {
  /*
   * Create new physicalAudit
   */
  physicalAuditsAdd(root, args, { user }) {
    return PhysicalAudits.createPhysicalAudit(args, user._id);
  },

  /**
   * Update physicalAudit
   * @param {String} _id - physicalAudits id
   * @param {Object} fields - physicalAudits fields
   * @return {Promise} updated physicalAudit object
   */
  physicalAuditsEdit(root, { _id, ...fields }) {
    return PhysicalAudits.updatePhysicalAudit(_id, fields);
  },

  /**
   * Delete physicalAudit
   * @param {String} doc - physicalAudits fields
   * @return {Promise}
   */
  physicalAuditsRemove(root, { _id }) {
    return PhysicalAudits.removePhysicalAudit(_id);
  },
};

moduleRequireBuyer(physicalAuditMutations);

export default physicalAuditMutations;
