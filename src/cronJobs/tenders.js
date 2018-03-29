import schedule from 'node-schedule';
import { Users, Companies, Tenders } from '../db/models';
import utils from '../data/utils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const { FROM_EMAIL_TENDER } = process.env;

  const publishedTenderIds = await Tenders.publishDrafts();
  const publishedTenders = await Tenders.find({ _id: { $in: publishedTenderIds } });

  // send published email to suppliers
  for (const tender of publishedTenders) {
    const suppliers = await Companies.find({ _id: { $in: tender.supplierIds } });

    for (const supplier of suppliers) {
      utils.sendEmail({
        fromEmail: FROM_EMAIL_TENDER,
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

  const closedTenderIds = await Tenders.closeOpens();
  const closedTenders = await Tenders.find({ _id: { $in: closedTenderIds } });

  // send closed email to suppliers
  for (const tender of closedTenders) {
    const createdUser = await Users.findOne({ _id: tender.createdUserId });
    const type = tender.type === 'rfq' ? 'RFQ' : 'EOI';

    utils.sendEmail({
      fromEmail: FROM_EMAIL_TENDER,
      toEmails: [createdUser.email],
      title: `${type} close notification - ${tender.number} - ${tender.name}`,
      template: {
        name: 'tender_close',
        data: {
          tender,
        },
      },
    });
  }

  console.log('Checked tender status'); // eslint-disable-line
});
