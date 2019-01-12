import mongoose, { Schema } from 'mongoose';
import { field } from './utils';

const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
  },
  { _id: false },
);

const MessageSchema = new Schema(
  {
    tenderId: field({ type: String }),
    fromBuyerId: field({ type: String, optional: true }),
    toSupplierIds: [String],
    fromSupplierId: field({ type: String, optional: true }),
    subject: field({ type: String }),
    body: field({ type: String }),
    attachment: attachmentSchema,
    isAuto: field({ type: Boolean, default: false }),
    isRead: field({ type: Boolean, default: false }),
    isReplySent: field({ type: Boolean, default: false }),
  },
  {
    timestamps: true,
  },
);

class Message {
  static async getAllForTender({ tenderId }) {
    return this.find({ tenderId });
  }
  static async getTenderToSupplier({ tenderId, toSupplierId }) {
    return this.find({
      tenderId,
      toSupplierIds: toSupplierId,
    });
  }
}

MessageSchema.loadClass(Message);

const MessageModel = mongoose.model('messages', MessageSchema);

export default MessageModel;
