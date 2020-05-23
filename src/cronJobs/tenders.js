import schedule from 'node-schedule';
import { Tenders, TenderLogs } from '../db/models';
import { sendEmail, sendEmailToSuppliers, getAttachments } from '../data/tenderUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const extraBuyerEmails = [process.env.TENDER_SUPERVISOR_EMAIL];

  // send published email to suppliers ============
  const publishedTenderIds = await Tenders.publishDrafts();
  const publishedTenders = await Tenders.find({ _id: { $in: publishedTenderIds } });

  for (const tender of publishedTenders) {
    const attachments = await getAttachments(tender);

    if (tender.isDeleted) {
      continue;
    }

    await sendEmail({
      kind: 'publish',
      tender,
      attachments,
      extraBuyerEmails,
    });

    // write open log
    await TenderLogs.write({
      tenderId: tender._id,
      isAuto: true,
      action: 'publish',
      description: `System published a tender ${tender.number}`,
    });
  }

  // send closed email to suppliers ================
  const closedTenderIds = await Tenders.closeOpens();
  const closedTenders = await Tenders.find({ _id: { $in: closedTenderIds } });

  for (const tender of closedTenders) {
    if (tender.isDeleted) {
      continue;
    }

    await sendEmail({ kind: 'close', tender, extraBuyerEmails });

    // write close lo
    await TenderLogs.write({
      tenderId: tender._id,
      isAuto: true,
      action: 'close',
      description: `System closed a tender ${tender.number}`,
    });
  }

  console.log('Checked tender status'); // eslint-disable-line
});

// every day at 23 45
schedule.scheduleJob('0 45 23 * * *', async () => {
  // send reminder email to suppliers ================
  const remindTenders = await Tenders.tendersToRemind();

  for (const tender of remindTenders) {
    sendEmailToSuppliers({ kind: 'supplier__reminder', tender });

    // write remind log
    await TenderLogs.write({
      tenderId: tender._id,
      isAuto: true,
      action: 'remind',
      description: `System sent a reminder of tender ${tender.number}`,
    });
  }

  console.log('Checked tender reminder'); // eslint-disable-line
});
