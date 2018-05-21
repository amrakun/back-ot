import schedule from 'node-schedule';
import { Audits } from '../db/models';
import { sendEmailToSupplier } from '../data/auditUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const publishedAuditIds = await Audits.publishDrafts();
  const publishedAudits = await Audits.find({ _id: { $in: publishedAuditIds } });

  // send published email to suppliers
  for (const audit of publishedAudits) {
    for (const supplierId of audit.supplierIds) {
      await sendEmailToSupplier({ kind: 'supplier__invitation', supplierId });
    }
  }

  await Audits.closeOpens();

  console.log('Checked audit status'); // eslint-disable-line
});
