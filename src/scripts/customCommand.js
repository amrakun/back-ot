import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders, TenderResponses } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL);

  const tenders = await Tenders.find({});

  let count = 0;

  for (const tender of tenders) {
    const requestedProducts = tender.requestedProducts || [];

    if (requestedProducts.length > 0) {
      let status = 'valid';

      const responses = await TenderResponses.find({ tenderId: tender._id });

      for (const response of responses) {
        const respondedProducts = response.respondedProducts || [];

        if (respondedProducts.length > 0 && requestedProducts.length !== respondedProducts.length) {
          status = 'invalid';
          break;
        }
      }

      if (status === 'invalid') {
        count++;
      }
    }
  }

  console.log(count);

  mongoose.connection.close();
};

customCommand();
