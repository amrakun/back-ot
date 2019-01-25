import mongoose from 'mongoose';
import { field } from './utils';

const tenderLogSchema = new mongoose.Schema(
  {
    tenderId: field({ type: String }),
    isAuto: field({ type: Boolean, default: false }),
    userId: field({ type: String, optional: true }),
    action: field({ type: String }),
    description: field({ type: String }),
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

const TenderLogModel = mongoose.model('tender_logs', tenderLogSchema);

export default TenderLogModel;
