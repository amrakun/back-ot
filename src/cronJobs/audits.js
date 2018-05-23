import schedule from 'node-schedule';
import { Companies, Audits } from '../db/models';
import { sendEmailToSupplier } from '../data/auditUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const publishedAuditIds = await Audits.publishDrafts();
  const publishedAudits = await Audits.find({ _id: { $in: publishedAuditIds } });

  // send published email to suppliers
  for (const audit of publishedAudits) {
    for (const supplierId of audit.supplierIds) {
      const supplier = await Companies.findOne({ _id: supplierId });

      await sendEmailToSupplier({
        kind: 'supplier__invitation',
        supplierId,
        replacer: text => {
          return text
            .replace('{publishDate}', audit.publishDate.toLocaleString())
            .replace('{closeDate}', audit.closeDate.toLocaleString())
            .replace('{supplier.name}', supplier.basicInfo.enName);
        },
      });
    }
  }

  await Audits.closeOpens();

  console.log('Checked audit status'); // eslint-disable-line
});
