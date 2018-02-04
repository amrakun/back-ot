import moment from 'moment';
import schedule from 'node-schedule';
import { Users, Companies, BlockedCompanies } from '../db/models';
import utils from '../data/utils';

// every day at 23 45
schedule.scheduleJob('* 45 23 * *', async () => {
  const blockedCompanies = await BlockedCompanies.find(BlockedCompanies.blockedRangeQuery());

  for (const blockedCompany of blockedCompanies) {
    const createdUser = await Users.findOne({ _id: blockedCompany.createdUserId });
    const supplier = await Companies.findOne({ _id: blockedCompany.supplierId });

    const endDate = moment(blockedCompany.endDate);
    const now = moment();

    if (endDate.diff(now, 'days') <= 7) {
      utils.sendEmail({
        toEmails: [createdUser.email],
        title: 'Blocked supplier notification',
        template: {
          name: 'base',
          data: {
            content: `${supplier.basicInfo.enName}'s block end date is about to expire`,
          },
        },
      });
    }
  }

  console.log('Blocked companies cron'); // eslint-disable-line
});
