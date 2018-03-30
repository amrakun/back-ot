import { ActivityLogs } from '../../../db/models';

const logMutations = {
  logsWrite(root, { apiCall }, { user }) {
    return ActivityLogs.write({ apiCall: apiCall.substring(1), userId: user._id });
  },
};

export default logMutations;