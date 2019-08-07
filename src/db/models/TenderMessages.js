import mongoose, { Schema } from 'mongoose';
import { field } from './utils';

const attachmentSchema = new Schema(
  {
    name: field({ type: String, label: 'File name' }),
    url: field({ type: String, label: 'File url' }),
  },
  { _id: false },
);

export const tenderMessageSchema = new Schema(
  {
    tenderId: field({ type: String, label: 'Tender id' }),
    senderBuyerId: field({ type: String, optional: true, label: 'Buyer id' }),
    recipientSupplierIds: field({ type: [String], label: 'Recipient suppliers' }),
    senderSupplierId: field({ type: String, optional: true, label: 'Sender' }),
    replyToId: field({ type: String, optional: true, label: 'Reply' }),
    subject: field({ type: String, label: 'Message subject' }),
    body: field({ type: String, label: 'Message body' }),
    attachment: field({ type: attachmentSchema, label: 'Attachment' }),
    isAuto: field({ type: Boolean, default: false, label: 'Is automatically sent' }),
    isRead: field({ type: Boolean, default: false, label: 'Is read' }),
    isReplySent: field({ type: Boolean, default: false, label: 'Is reply sent' }),
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
