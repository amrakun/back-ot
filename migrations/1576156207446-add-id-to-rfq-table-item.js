import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders, TenderResponses } from '../src/db/models';

dotenv.config();

mongoose.Promise = global.Promise;

module.exports.up = async next => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  const tenders = await Tenders.find({});

  let count = 0;

  for (const tender of tenders) {
    const requestedProducts = tender.requestedProducts || [];

    if (requestedProducts.length === 0) {
      continue;
    }

    const updatedRequestedProducts = requestedProducts.map(rp => ({
      productId: Math.random().toString(),
      ...rp.toObject(),
    }));

    const responses = await TenderResponses.find({ tenderId: tender._id });

    for (const response of responses) {
      const respondedProducts = response.respondedProducts || [];

      if (respondedProducts.length === 0) {
        continue;
      }

      const updatedRespondedProducts = [];

      for (const [index, requestedProduct] of updatedRequestedProducts.entries()) {
        const respondedProduct = respondedProducts[index];

        if (respondedProduct) {
          updatedRespondedProducts.push({
            productId: requestedProduct.productId,
            ...respondedProduct.toObject(),
          });
        }
      }

      await TenderResponses.update(
        { _id: response._id },
        { $set: { respondedProducts: updatedRespondedProducts } },
      );
    }

    await Tenders.update(
      { _id: tender._id },
      { $set: { requestedProducts: updatedRequestedProducts } },
    );

    count++;
  }

  console.log(count);

  mongoose.connection.close();

  next();
};

module.exports.down = next => {
  next();
};
