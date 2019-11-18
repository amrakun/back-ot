import mongoose, { Schema } from 'mongoose';
import { field } from './utils';

export const attachmentSchema = new Schema(
  {
    name: field({ type: String, label: 'Name' }),
    url: field({ type: String, label: 'Url' }),
  },
  { _id: false },
);

export const tenderMessageSchema = new Schema(
  {
    tenderId: field({ type: String, label: 'Tender' }),
    senderBuyerId: field({ type: String, optional: true, label: 'Buyer' }),
    recipientSupplierIds: field({ type: [String], label: 'Recipient suppliers', optional: true }),
    eoiTargets: field({ type: String, optional: true, label: 'Eoi targets' }),
    senderSupplierId: field({ type: String, optional: true, label: 'Supplier' }),
    replyToId: field({ type: String, optional: true, label: 'Reply to message with subject' }),
    subject: field({ type: String, label: 'Message subject' }),
    body: field({ type: String, label: 'Message body' }),
    attachment: field({ type: attachmentSchema, label: 'Attachment', optional: true }),
    isAuto: field({ type: Boolean, default: false, label: 'Is automatically sent' }),
    isRead: field({ type: Boolean, default: false, label: 'Is read' }), // TODO: remove
    readUserIds: field({ type: [String], optional: true }),
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
    const selector = { _id };
    const message = await this.findOne(selector);

    if (!message) {
      throw new Error('Message not found');
    }

    const readUserIds = message.readUserIds || [];

    await this.update(selector, { $set: { readUserIds: [...readUserIds, user._id] } });

    return this.findOne(selector);
  }
}

tenderMessageSchema.loadClass(TenderMessage);

const TenderMessageModel = mongoose.model('tender_messages', tenderMessageSchema);

export default TenderMessageModel;
