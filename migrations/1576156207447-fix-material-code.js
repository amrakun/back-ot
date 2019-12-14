import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders } from '../src/db/models';

dotenv.config();

mongoose.Promise = global.Promise;

module.exports.up = async next => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  const tenders = await Tenders.find({ status: { $nin: ['awarded', 'canceled'] } });

  let count = 0;

  for (const tender of tenders) {
    const requestedProducts = tender.requestedProducts || [];

    let status = 'valid';

    for (const requestedProduct of requestedProducts) {
      const pr = (requestedProduct.purchaseRequestNumber || '').toString();

      if (
        !(pr.startsWith('25') || pr.startsWith('26') || pr.startsWith('27') || pr.startsWith('28'))
      ) {
        status = 'invalid';
      }
    }

    if (status === 'invalid') {
      count++;
    }
  }

  console.log(count);

  mongoose.connection.close();

  next();
};

module.exports.down = next => {
  next();
};
