import schedule from 'node-schedule';
import { AuditResponses, Qualifications, Companies } from '../db/models';

// every day at 23 45
schedule.scheduleJob('* 45 23 * *', async () => {
  const companies = await Companies.find({});

  for (const company of companies) {
    await Qualifications.resetPrequalification(company._id);
    await AuditResponses.resetQualification(company._id);
  }

  console.log('Companies cron'); // eslint-disable-line
});
