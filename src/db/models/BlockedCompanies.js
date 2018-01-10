import mongoose from 'mongoose';
import { field } from './utils';

// Blocked company schema
const BlockedCompanySchema = mongoose.Schema({
  supplierId: field({ type: String }),
  startDate: field({ type: Date }),
  endDate: field({ type: Date }),
  note: field({ type: String }),

  createdUserId: field({ type: String }),
});

class BlockedCompany {
  /**
   * Create new blockedCompany
   * @param {Object} doc - blockedCompany fields
   * @return {Promise} newly created blockedCompany object
   */
  static block(doc, userId) {
    return this.create({ ...doc, createdUserId: userId });
  }

  /*
   * Remove blocked item
   */
  static unblock(supplierId) {
    return this.remove({ supplierId });
  }
}

BlockedCompanySchema.loadClass(BlockedCompany);

const BlockedCompanies = mongoose.model('blockedCompanies', BlockedCompanySchema);

export default BlockedCompanies;
