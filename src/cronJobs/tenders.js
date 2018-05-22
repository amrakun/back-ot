import schedule from 'node-schedule';
import { Tenders } from '../db/models';
import { sendEmail } from '../data/tenderUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  // send published email to suppliers ============
  const publishedTenderIds = await Tenders.publishDrafts();
  const publishedTenders = await Tenders.find({ _id: { $in: publishedTenderIds } });

  for (const tender of publishedTenders) {
    await sendEmail({ kind: 'publish', tender });
  }

  // send closed email to suppliers ================
  const closedTenderIds = await Tenders.closeOpens();
  const closedTenders = await Tenders.find({ _id: { $in: closedTenderIds } });

  for (const tender of closedTenders) {
    await sendEmail({ kind: 'close', tender });
  }

  // send reminder email to suppliers ================
  const remindTenders = await Tenders.tendersToRemind();

  for (const tender of remindTenders) {
    await sendEmail({ kind: 'reminder', tender });
  }

  console.log('Checked tender status'); // eslint-disable-line
});
