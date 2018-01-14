import { Qualifications } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const qualificationQueries = {
  /**
   * Qualification detail
   */
  qualificationDetail(root, { supplierId }) {
    return Qualifications.findOne({ supplierId });
  },
};

moduleRequireBuyer(qualificationQueries);

export default qualificationQueries;
