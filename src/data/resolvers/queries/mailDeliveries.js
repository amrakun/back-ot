import { moduleRequireBuyer } from '../../permissions';
import { fetchMailer } from '../../../data/utils';

const mailDeliveryQueries = {
  /**
   * MailDeliveries list
   */
  mailDeliveries(root, args) {
    return fetchMailer('deliveries', { search: args.search });
  },

  async mailDeliveriesTotalCount() {
    const response = await fetchMailer('deliveriesTotalCount');
    return response.count;
  },
};

moduleRequireBuyer(mailDeliveryQueries);

export default mailDeliveryQueries;
