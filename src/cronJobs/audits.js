import schedule from 'node-schedule';
import { Audits } from '../db/models';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  await Audits.publishDrafts();
  await Audits.closeOpens();

  console.log('Checked audit status'); // eslint-disable-line
});
