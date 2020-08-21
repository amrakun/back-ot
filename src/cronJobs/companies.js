import schedule from 'node-schedule';
import { AuditResponses, Qualifications, Companies, DueDiligences } from '../db/models';

// every day at 23 45
schedule.scheduleJob('0 45 23 * * *', async () => {
  const companies = await Companies.find({});

  for (const company of companies) {
    await Qualifications.resetPrequalification(company._id);
    await AuditResponses.resetQualification(company._id);
    await DueDiligences.resetDueDiligence(company._id);
  }

  console.log('Companies cron'); // eslint-disable-line
});
