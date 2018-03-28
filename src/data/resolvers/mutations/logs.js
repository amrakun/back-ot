import { ActivityLogs } from '../../../db/models';

const logMutations = {
  logsWrite(root, { apiCall }, { user }) {
    console.log('AAAAAAAAA: ', apiCall.substring(1));
    console.log('apiCall: ', apiCall.substring(1));
    return ActivityLogs.write({ apiCall: apiCall.substring(1), userId: user._id });
  },
};

export default logMutations;
