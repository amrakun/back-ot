import { Audits } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const auditQueries = {
  /**
   * Audits list
   */
  audits() {
    return Audits.find({});
  },

  /**
   * Audit detail
   */
  auditDetail(root, { _id }) {
    return Audits.findOne({ _id });
  },
};

moduleRequireBuyer(auditQueries);

export default auditQueries;
