import { MailDeliveries } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';
import { paginate } from './utils';

const mailDeliveryQueries = {
  /**
   * MailDeliveries list
   */
  mailDeliveries(root, args) {
    const { search = '' } = args;
    const reg = new RegExp(`.*${search}.*`, 'i');

    const selector = {
      $or: [{ from: reg }, { to: reg }, { subject: reg }, { content: reg }, { status: reg }],
    };

    const deliveries = paginate(MailDeliveries.find(selector), args);

    return deliveries.sort({ createdDate: -1 });
  },

  mailDeliveriesTotalCount() {
    return MailDeliveries.find({}).count();
  },
};

moduleRequireBuyer(mailDeliveryQueries);

export default mailDeliveryQueries;
