import { ActivityLogs, TenderLogs } from '../../../db/models';
import { requireLogin } from '../../permissions';

const logMutations = {
  logsWrite(root, { apiCall }, { user }) {
    return ActivityLogs.write({ apiCall: apiCall.substring(1), userId: user._id });
  },
  logsWriteTenderLog(root, { tenderId, action, description }, { user }) {
    return TenderLogs.write({ tenderId, action, description, userId: user._id });
  },
};

requireLogin(logMutations, 'logsWrite');
requireLogin(logMutations, 'logsWriteTenderLog');

export default logMutations;
