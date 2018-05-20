import schedule from 'node-schedule';
import { Tenders } from '../db/models';
import { sendEmail } from '../data/tenderUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const publishedTenderIds = await Tenders.publishDrafts();
  const publishedTenders = await Tenders.find({ _id: { $in: publishedTenderIds } });

  // send published email to suppliers
  for (const tender of publishedTenders) {
    await sendEmail({ kind: 'publish', tender });
  }

  const closedTenderIds = await Tenders.closeOpens();
  const closedTenders = await Tenders.find({ _id: { $in: closedTenderIds } });

  // send closed email to suppliers
  for (const tender of closedTenders) {
    await sendEmail({ kind: 'close', tender });
  }

  console.log('Checked tender status'); // eslint-disable-line
});
