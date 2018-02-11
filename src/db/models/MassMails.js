import mongoose from 'mongoose';
import { field } from './utils';

// Blocked company schema
const MassMailSchema = mongoose.Schema({
  supplierIds: field({ type: [String] }),

  subject: field({ type: String }),
  content: field({ type: String }),

  status: field({ type: Object }),

  createdDate: field({ type: Date }),
  createdUserId: field({ type: String }),
});

class MassMail {
  static send(doc, userId) {
    return this.create({
      ...doc,
      status: {},
      createdUserId: userId,
      createdDate: new Date(),
    });
  }
}

MassMailSchema.loadClass(MassMail);

const MassMails = mongoose.model('massEmails', MassMailSchema);

export default MassMails;
