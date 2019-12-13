import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { uniq } from 'underscore';
import { Tenders, TenderResponses } from '../src/db/models';

dotenv.config();

mongoose.Promise = global.Promise;

module.exports.up = async next => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  const tenders = await Tenders.find({
    createdDate: { $gt: new Date('2019-11-01') },
    status: 'closed',
  });

  let count = 0;

  for (const tender of tenders) {
    const requestedProducts = tender.requestedProducts || [];
    const requestedProductsUniqueCodes = uniq(requestedProducts.map(rp => rp.code));
    const isAllProductsHaveUniqueCode =
      requestedProducts.length === requestedProductsUniqueCodes.length;

    if (requestedProducts.length > 0) {
      let status = 'valid';

      const responses = await TenderResponses.find({ tenderId: tender._id });

      for (const response of responses) {
        const respondedProducts = response.respondedProducts || [];

        if (respondedProducts.length > 0 && requestedProducts.length !== respondedProducts.length) {
          status = 'invalid';
        }
      }

      if (status === 'invalid' && isAllProductsHaveUniqueCode) {
        for (const response of responses) {
          const respondedProducts = response.respondedProducts || [];
          const fixedRespondedProducts = [];

          for (const respondedProduct of respondedProducts) {
            const requestedProduct = requestedProducts.find(
              rp => rp.code === respondedProduct.code,
            );

            fixedRespondedProducts.push({
              ...respondedProduct.toObject(),
              id: requestedProduct.id,
            });
          }

          await TenderResponses.update(
            { _id: response._id },
            { $set: { respondedProducts: fixedRespondedProducts } },
          );
        }

        count++;
      }
    }
  }

  console.log(count);

  mongoose.connection.close();

  next();
};

module.exports.down = next => {
  next();
};
