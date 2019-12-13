import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders, TenderResponses, Companies } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL);

  const tenders = await Tenders.find({ createdDate: { $gt: new Date('2019-11-01') } });

  let count = 0;

  for (const tender of tenders) {
    const requestedProducts = tender.requestedProducts || [];

    if (requestedProducts.length > 0) {
      let status = 'valid';
      let isInvalidResponseAwarded = false;
      const invalidResponses = [];

      const responses = await TenderResponses.find({ tenderId: tender._id });

      for (const response of responses) {
        const respondedProducts = response.respondedProducts || [];

        if (respondedProducts.length > 0 && requestedProducts.length !== respondedProducts.length) {
          status = 'invalid';

          const supplier = await Companies.findOne({ _id: response.supplierId });
          invalidResponses.push(supplier.basicInfo.enName);

          if (tender.getWinnerIds().includes(response._id.toString())) {
            isInvalidResponseAwarded = true;

            console.log('danger ...................');
          }
        }
      }

      if (status === 'invalid') {
        console.log(tender._id, tender.number, tender.status, invalidResponses);
        count++;
      }
    }
  }

  console.log(count);

  mongoose.connection.close();
};

customCommand();
