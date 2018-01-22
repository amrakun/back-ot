import schedule from 'node-schedule';
import { Tenders } from '../db/models';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  await Tenders.publishDrafts();
  await Tenders.closeOpens();

  console.log('Checked tender status'); // eslint-disable-line
});
