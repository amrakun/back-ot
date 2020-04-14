import schedule from 'node-schedule';
import { Companies, Audits, AuditResponses } from '../db/models';
import { sendEmail } from '../data/auditUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const publishedAuditIds = await Audits.publishDrafts();
  const publishedAudits = await Audits.find({ _id: { $in: publishedAuditIds } });

  // send published email to suppliers
  for (const audit of publishedAudits) {
    for (const supplierId of audit.supplierIds) {
      const supplier = await Companies.findOne({ _id: supplierId });

      await sendEmail({
        kind: 'supplier__invitation',
        toEmails: [supplier.basicInfo.email],
        audit,
        supplier,
      });
    }
  }

  await Audits.closeOpens();
  await AuditResponses.disabledEditableResponses();

  console.log('Checked audit status'); // eslint-disable-line
});

// every day at 23 45
schedule.scheduleJob('0 45 23 * * *', async () => {
  // check improvement date due date
  const responses = await AuditResponses.find({ isQualified: { $ne: true } });

  for (const response of responses) {
    await AuditResponses.notifyImprovementPlan(response._id);
  }

  console.log('Checked improvement plan notification'); // eslint-disable-line
});
