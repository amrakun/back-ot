import mongoose from 'mongoose';
import { field } from './utils';
import { Tenders } from './Tenders';

// SearchLog schema
const SearchLogSchema = mongoose.Schema({
  createdDate: field({ type: Date }),
  userId: field({ type: String }),
  numberOfSearches: field({ type: Number, default: 0 }),
});

SearchLogSchema.loadClass(
  class {
    static async createLog(userId) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      let userSearchLog = await this.findOne({
        createdDate: {
          $gte: todayStart.toISOString(),
          $lt: todayEnd.toISOString(),
        },
      });

      if (!userSearchLog) {
        userSearchLog = await this.create({
          userId,
          numberOfSearches: 1,
          createdDate: new Date(),
        });
      } else {
        userSearchLog.numberOfSearches++;
        await userSearchLog.save();
      }

      return userSearchLog;
    }
  },
);

export const SearchLogs = mongoose.model('search_logs', SearchLogSchema);

// TenderResponseLog schema
const TenderResponseLogSchema = mongoose.Schema({
  createdDate: field({ type: Date }),
  userId: field({ type: String }),
  tenderType: field({ type: String }),
});

TenderResponseLogSchema.loadClass(
  class {
    static async createLog(tenderResponse, userId) {
      const tender = await Tenders.findOne({ _id: tenderResponse.tenderId });
      const userSearchLog = await this.create({
        userId,
        tenderType: tender.type,
        createdDate: new Date(),
      });
      return userSearchLog.save();
    }
  },
);

export const TenderResponseLogs = mongoose.model('tender_response_logs', TenderResponseLogSchema);
