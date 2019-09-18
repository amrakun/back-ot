import { moduleRequireBuyer } from '../../permissions';

const mailDeliveryQueries = {
  /**
   * MailDeliveries list
   */
  mailDeliveries(root, args) {
    return [];
  },

  mailDeliveriesTotalCount() {
    return 0;
  },
};

moduleRequireBuyer(mailDeliveryQueries);

export default mailDeliveryQueries;
