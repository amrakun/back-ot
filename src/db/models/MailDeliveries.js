import mongoose from 'mongoose';
import { field } from './utils';

const MailDeliverySchema = mongoose.Schema({
  createdDate: field({ type: Date }),

  mailId: field({ type: String }),
  from: field({ type: String }),
  to: field({ type: String }),
  subject: field({ type: String }),
  html: field({ type: String }),
  status: field({ type: String }),
});

class MailDelivery {
  static createStatus(doc) {
    return this.create({
      ...doc,
      createdDate: new Date(),
    });
  }

  static updateStatus({ status, mailId }) {
    return this.update({ mailId }, { $set: { status } });
  }
}

MailDeliverySchema.loadClass(MailDelivery);

const MailDeliveries = mongoose.model('mail_deliveries', MailDeliverySchema);

export default MailDeliveries;
