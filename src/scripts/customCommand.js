import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { uniq } from 'underscore';
import { Tenders, TenderResponses } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

const command = async next => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  const tenders = await Tenders.find({});

  // const tenders = await Tenders.find({
  //   createdDate: { $gt: new Date('2019-11-01') },
  //   status: 'closed',
  // });

  let allInvalid = 0;
  let withUniqueCodes = 0;

  for (const tender of tenders) {
    const requestedProducts = tender.requestedProducts || [];

    if (requestedProducts.length === 0) {
      continue;
    }

    const requestedProductsUniqueCodes = uniq(requestedProducts.map(rp => rp.code));
    const isAllProductsHaveUniqueCode =
      requestedProducts.length === requestedProductsUniqueCodes.length;

    let status = 'valid';

    const responses = await TenderResponses.find({ tenderId: tender._id });

    for (const response of responses) {
      const respondedProducts = response.respondedProducts || [];

      if (respondedProducts.length > 0 && requestedProducts.length !== respondedProducts.length) {
        status = 'invalid';
      }
    }

    if (status === 'invalid') {
      allInvalid++;

      if (isAllProductsHaveUniqueCode) {
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

          // await TenderResponses.update(
          //   { _id: response._id },
          //   { $set: { respondedProducts: fixedRespondedProducts } },
          // );
        }

        withUniqueCodes++;
      }
    }
  }

  console.log('All invalid: ', allInvalid, 'With unique codes: ', withUniqueCodes);

  mongoose.connection.close();
};

command();
