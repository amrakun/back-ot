import { moduleRequireBuyer } from '../../permissions';
import { fetchMailer } from '../../../data/utils';

const mailDeliveryQueries = {
  /**
   * MailDeliveries list
   */
  mailDeliveries(root, args) {
    return fetchMailer('deliveries', args);
  },

  async mailDeliveriesTotalCount(root, args) {
    const response = await fetchMailer('deliveriesTotalCount', { search: args.search });
    return response.count;
  },
};

moduleRequireBuyer(mailDeliveryQueries);

export default mailDeliveryQueries;
