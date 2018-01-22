import mongoose from 'mongoose';
import moment from 'moment';
import { field } from './utils';

// Blocked company schema
const BlockedCompanySchema = mongoose.Schema({
  supplierId: field({ type: String }),
  startDate: field({ type: Date }),
  endDate: field({ type: Date }),
  note: field({ type: String, optional: true }),

  createdUserId: field({ type: String }),
});

class BlockedCompany {
  /**
   * Create new blockedCompany
   * @param {Object} doc - blockedCompany fields
   * @return {Promise} newly created blockedCompany object
   */
  static async block(doc, userId) {
    const { supplierId } = doc;

    // update previous one
    if (await this.findOne({ supplierId })) {
      await this.update({ supplierId }, { $set: doc });

      return this.findOne({ supplierId });
    }

    return this.create({ ...doc, createdUserId: userId });
  }

  /*
   * Remove blocked item
   */
  static unblock(supplierId) {
    return this.remove({ supplierId });
  }

  static blockedRangeQuery() {
    const today = moment().endOf('day');

    return {
      startDate: { $lte: today },
      endDate: { $gte: today },
    };
  }

  /*
   * Check is given supplier blocked
   */
  static async isBlocked(supplierId) {
    const count = await this.find({ supplierId, ...this.blockedRangeQuery() }).count();

    return count > 0;
  }

  /*
   * Blocked supplier ids
   */
  static async blockedIds() {
    const blockedItems = await this.find(this.blockedRangeQuery());

    return blockedItems.map(i => i.supplierId);
  }
}

BlockedCompanySchema.loadClass(BlockedCompany);

const BlockedCompanies = mongoose.model('blockedCompanies', BlockedCompanySchema);

export default BlockedCompanies;
