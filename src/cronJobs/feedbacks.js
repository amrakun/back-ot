import schedule from 'node-schedule';
import { Feedbacks } from '../db/models';

// every day at 0 0
// 0 0 * * *
schedule.scheduleJob('*/5 * * * *', async () => {
  await Feedbacks.closeOpens();

  console.log('Checked success feedback status'); // eslint-disable-line
});
