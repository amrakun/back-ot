import moment from 'moment';
import schedule from 'node-schedule';
import { Users, BlockedCompanies } from '../db/models';
import { sendConfigEmail } from '../data/utils';

// every day at 23 45
schedule.scheduleJob('* 45 23 * *', async () => {
  const blockedCompanies = await BlockedCompanies.find(BlockedCompanies.blockedRangeQuery());

  for (const blockedCompany of blockedCompanies) {
    const createdUser = await Users.findOne({ _id: blockedCompany.createdUserId });

    const endDate = moment(blockedCompany.endDate);
    const now = moment();

    if (endDate.diff(now, 'days') <= 7) {
      await sendConfigEmail({
        name: 'blockTemplates',
        kind: 'buyer__notification',
        toEmails: [createdUser.email],
      });
    }
  }

  console.log('Blocked companies cron'); // eslint-disable-line
});
