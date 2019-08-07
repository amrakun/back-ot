import mongoose from 'mongoose';

import { field } from './utils';
import { Users, Companies } from './';

// Blocked company schema
export const BlockedCompanySchema = mongoose.Schema({
  supplierId: field({ type: String, label: 'Supplier' }),

  // suppliers that are blocked at the same time. will have same groupId
  groupId: field({ type: String, label: 'Group id' }),

  startDate: field({ type: Date, label: 'Start date' }),
  endDate: field({ type: Date, label: 'End date' }),
  note: field({ type: String, optional: true, label: 'Note' }),

  createdUserId: field({ type: String, label: 'Created user' }),
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
    const now = new Date();

    return {
      startDate: { $lte: now },
      endDate: { $gte: now },
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

  /*
   * Get blocked suppliers grouped by groupId
   */
  static async blockedSuppliersByGroupId() {
    const blockedEntities = await this.find(this.blockedRangeQuery());

    const map = {};

    for (const entity of blockedEntities) {
      if (!map[entity.groupId]) {
        map[entity.groupId] = {
          createdUser: await Users.findOne({ _id: entity.createdUserId }),
          endDate: entity.endDate,
          suppliers: [],
        };
      }

      const supplier = await Companies.findOne({ _id: entity.supplierId });

      map[entity.groupId].suppliers.push(supplier);
    }

    return Object.keys(map).map(key => map[key]);
  }
}

BlockedCompanySchema.loadClass(BlockedCompany);

const BlockedCompanies = mongoose.model('blockedCompanies', BlockedCompanySchema);

export default BlockedCompanies;
