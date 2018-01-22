import schedule from 'node-schedule';
import { Feedbacks } from '../db/models';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  await Feedbacks.closeOpens();

  console.log('Checked success feedback status'); // eslint-disable-line
});
