import moment from 'moment';
import schedule from 'node-schedule';
import { BlockedCompanies } from '../db/models';
import { sendConfigEmail } from '../data/utils';

// every day at 23 45
schedule.scheduleJob('* 45 23 * *', async () => {
  const blockedSuppliers = await BlockedCompanies.blockedSuppliersByGroupId();

  for (const { createdUser, endDate, suppliers } of blockedSuppliers) {
    const now = moment();

    if (endDate.diff(now, 'days') <= 7) {
      // supplier names to remind
      let supNames = '';

      for (const sup of suppliers) {
        supNames = `${supNames} ${supNames ? ',' : ''} ${sup.basicInfo.enName}`;
      }

      await sendConfigEmail({
        name: 'blockTemplates',
        kind: 'buyer__reminder',
        toEmails: [createdUser.email],
        replacer: text => {
          return text
            .replace('{endDate}', endDate.toLocaleString())
            .replace('{supplierNames}', supNames);
        },
      });
    }
  }

  console.log('Blocked companies cron'); // eslint-disable-line
});
