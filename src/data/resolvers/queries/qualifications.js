import { Qualifications } from '../../../db/models';
import { requireBuyer, requireSupplier } from '../../permissions';

const qualificationQueries = {
  /**
   * Qualification detail
   */
  qualificationDetail(root, { supplierId }) {
    return Qualifications.findOne({ supplierId });
  },

  /**
   * Qualification detail by logged in user
   */
  qualificationDetailByUser(root, args, { user }) {
    return Qualifications.findOne({ supplierId: user.companyId });
  },
};

requireBuyer(qualificationQueries, 'qualificationDetail');
requireSupplier(qualificationQueries, 'qualificationDetailByUser');

export default qualificationQueries;
