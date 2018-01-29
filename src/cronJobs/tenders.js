import schedule from 'node-schedule';
import { Companies, Tenders } from '../db/models';
import utils from '../data/utils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const publishedTenderIds = await Tenders.publishDrafts();
  const publishedTenders = await Tenders.find({ _id: { $in: publishedTenderIds } });

  // send email to suppliers
  for (const tender of publishedTenders) {
    const suppliers = await Companies.find({ _id: { $in: tender.supplierIds } });

    for (const supplier of suppliers) {
      utils.sendEmail({
        toEmails: [supplier.basicInfo.email],
        title: tender.name,
        template: {
          name: 'tender',
          data: {
            content: tender.content,
          },
        },
      });
    }
  }

  await Tenders.closeOpens();

  console.log('Checked tender status'); // eslint-disable-line
});
