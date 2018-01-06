import schedule from 'node-schedule';
import { Tenders } from '../db/models';

// every day at 0 0
// 0 0 * * *
schedule.scheduleJob('*/5 * * * *', async () => {
  await Tenders.publishDrafts();
  await Tenders.closeOpens();

  console.log('Checked tender status'); // eslint-disable-line
});
