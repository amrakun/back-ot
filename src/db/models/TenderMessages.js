import mongoose, { Schema } from 'mongoose';
import { field } from './utils';

const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
  },
  { _id: false },
);

const tenderMessageSchema = new Schema(
  {
    tenderId: field({ type: String }),
    senderBuyerId: field({ type: String, optional: true }),
    recipientSupplierIds: [String],
    senderSupplierId: field({ type: String, optional: true }),
    replyToId: field({ type: String, optional: true }),
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

tenderMessageSchema.pre('save', () => {
  if (!this.isAuto) {
    if (!this.senderBuyerId && !this.senderSupplierId) {
      throw new Error('Must have sender');
    }
  }
});

class TenderMessage {
  static async isAuthorizedToDownload(key, user) {
    if (!user.isSupplier) {
      return true;
    }

    const message = await this.findOne({
      recipientSupplierIds: user.companyId,
      'attachment.url': key,
    });

    return !!message;
  }

  static async tenderMessageBuyerSend(args, user) {
    return this.create({
      ...args,
      senderBuyerId: user._id,
    });
  }

  static async tenderMessageSupplierSend(args, user) {
    return this.create({
      ...args,
      senderSupplierId: user.companyId,
    });
  }

  static async tenderMessageSetAsRead({ _id }, user) {
    const query = { _id };

    if (user.isSupplier) {
      query.recipientSupplierIds = user.companyId;
    }
    await this.update(query, { $set: { isRead: true } });
    return this.findOne(query);
  }
}

tenderMessageSchema.loadClass(TenderMessage);

const TenderMessageModel = mongoose.model('tender_messages', tenderMessageSchema);

export default TenderMessageModel;
