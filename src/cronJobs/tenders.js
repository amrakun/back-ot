import schedule from 'node-schedule';
import { Tenders } from '../db/models';
import { sendEmail, sendEmailToSuppliers, getAttachments } from '../data/tenderUtils';
import { readS3File } from '../data/utils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const extraBuyerEmails = [process.env.TENDER_SUPERVISOR_EMAIL];

  // send published email to suppliers ============
  const publishedTenderIds = await Tenders.publishDrafts();
  const publishedTenders = await Tenders.find({ _id: { $in: publishedTenderIds } });

  for (const tender of publishedTenders) {
    const attachments = await getAttachments(tender);

    await sendEmail({
      kind: 'publish',
      tender,
      attachments,
      extraBuyerEmails,
    });
  }

  // send closed email to suppliers ================
  const closedTenderIds = await Tenders.closeOpens();
  const closedTenders = await Tenders.find({ _id: { $in: closedTenderIds } });

  for (const tender of closedTenders) {
    await sendEmail({ kind: 'close', tender, extraBuyerEmails });
  }

  console.log('Checked tender status'); // eslint-disable-line
});

// every day at 23 45
schedule.scheduleJob('* 45 23 * *', async () => {
  // send reminder email to suppliers ================
  const remindTenders = await Tenders.tendersToRemind();

  for (const tender of remindTenders) {
    sendEmailToSuppliers({ kind: 'supplier__reminder', tender });
  }

  console.log('Checked tender reminder'); // eslint-disable-line
});
