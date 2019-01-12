import mongoose, { Schema } from 'mongoose';
import { field } from './utils';

const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
  },
  { _id: false },
);

const messageSchema = new Schema(
  {
    tenderId: field({ type: String }),
    senderBuyerId: field({ type: String, optional: true }),
    recipientSupplierIds: [String],
    senderSupplierId: field({ type: String, optional: true }),
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

messageSchema.pre('save', () => {
  if (!this.isAuto) {
    if (!this.senderBuyerId && !this.senderSupplierId) {
      throw new Error('Must have sender');
    }
  }
});

class Messages {
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

messageSchema.loadClass(Messages);

const MessageModel = mongoose.model('messages', messageSchema);

export default MessageModel;
