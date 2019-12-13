import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { uniq } from 'underscore';
import { Tenders, TenderResponses, Companies } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  const tenders = await Tenders.find({
    createdDate: { $gt: new Date('2019-11-01') },
    status: 'closed',
  });

  let totalInvalid = 0;
  let totalInvalidWithUniqueCodes = 0;
  let completeInvalidTenders = [];

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

      if (status === 'invalid') {
        totalInvalid++;

        if (isAllProductsHaveUniqueCode) {
          totalInvalidWithUniqueCodes++;
        } else {
          completeInvalidTenders.push(tender);
        }
      }
    }
  }

  console.log(totalInvalid, totalInvalidWithUniqueCodes);

  for (const tender of completeInvalidTenders) {
    const requestedProducts = tender.requestedProducts || [];

    console.log(
      `Requested products ========================== ${tender.number} ${JSON.stringify(
        requestedProducts,
      )}`,
    );

    const responses = await TenderResponses.find({ tenderId: tender._id });

    for (const response of responses) {
      if (response.respondedProducts.length === 0) {
        continue;
      }

      if (response.respondedProducts.length !== requestedProducts.length) {
        console.log(
          `Invalid response ========================================: ${JSON.stringify(
            response.respondedProducts,
          )}`,
        );
      }
    }
  }

  mongoose.connection.close();
};

customCommand();
