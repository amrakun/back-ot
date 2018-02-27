import { moduleRequireBuyer } from '../../permissions';
import { userLogins, activitiesPerBuyer } from './logExports';

const logQueries = {
  /**
   *
   */
  async logsUserLastLoginsExport(root, { startDate, endDate }, { user }) {
    return userLogins({ startDate, endDate }, user);
  },

  /**
   * Activities per buyer
   */
  async logsActivitiesPerBuyerExport(root, { startDate, endDate }, { user }) {
    return activitiesPerBuyer({ startDate: new Date(startDate), endDate: new Date(endDate) }, user);
  },
};

moduleRequireBuyer(logQueries);

export default logQueries;
