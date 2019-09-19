import mongoose from 'mongoose';
import { field } from './utils';
import { Tenders } from './Tenders';
import { MODULES } from '../../data/constants';

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
        userId,
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

// SuppliersByProductCodeLog schema
const SuppliersByProductCodeLogSchema = mongoose.Schema({
  registeredDate: field({ type: Date }),
  supplierId: field({ type: String }),
  startDate: field({ type: Date }),
  endDate: field({ type: Date, optional: true }),
  createdDate: field({ type: Date }),
  productCodes: [String],
});

SuppliersByProductCodeLogSchema.loadClass(
  class {
    static async createLog(supplier) {
      // update last log for the supplier
      const results = await this.find({ supplierId: supplier._id.toString() }).sort({
        startDate: -1,
      });

      if (results.length > 0) {
        const lastLog = await this.findOne({ _id: results[0]._id });
        lastLog.endDate = new Date();
        await lastLog.save();
      }

      // create new log
      let productCodes = [];
      const groupInfo = supplier.groupInfo;

      for (let factory of (groupInfo || { factories: [{ productCodes: [] }] }).factories) {
        productCodes = productCodes.concat(factory.productCodes);
      }

      return await this.create({
        supplierId: supplier._id,
        registeredDate: supplier.createdDate,
        startDate: new Date(),
        createdDate: new Date(),
        productCodes,
      });
    }
  },
);

export const SuppliersByProductCodeLogs = mongoose.model(
  'suppliers_by_product_code_logs',
  SuppliersByProductCodeLogSchema,
);

const ActivityLogSchema = mongoose.Schema({
  createdDate: field({ type: Date }),
  userId: field({ type: String }),
  module: field({ type: String }),
});

ActivityLogSchema.loadClass(
  class {
    static write({ apiCall, userId }) {
      if (MODULES.ALL.indexOf(apiCall) != -1) {
        return this.create({
          module: apiCall,
          userId,
          createdDate: new Date(),
        });
      }
    }
  },
);

// Action	Date Created User Details
export const ActivityLogs = mongoose.model('activity_logs', ActivityLogSchema);

// Tender logs
const tenderLogSchema = new mongoose.Schema(
  {
    tenderId: field({ type: String }),
    isAuto: field({ type: Boolean, default: false }),
    userId: field({ type: String, optional: true }),
    action: {
      type: String,
      enum: [
        'award',
        'cancel',
        'close',
        'create',
        'edit',
        'extend',
        'publish',
        'remind',
        'remove',
        'reopen',
        'view',
        'download',
      ],
      required: true,
    },
    description: field({ type: String, optional: true }),
  },
  {
    timestamps: true,
  },
);

class TenderLog {
  static async write(doc) {
    return this.create(doc);
  }
}

tenderLogSchema.loadClass(TenderLog);

export const TenderLogs = mongoose.model('tender_logs', tenderLogSchema);
