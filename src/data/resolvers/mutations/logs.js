import { ActivityLogs } from '../../../db/models';
import { requireLogin } from '../../permissions';

const logMutations = {
  logsWrite(root, { apiCall }, { user }) {
    return ActivityLogs.write({ apiCall: apiCall.substring(1), userId: user._id });
  },
};

requireLogin(logMutations, 'logsWrite');

export default logMutations;
