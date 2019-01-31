import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Tenders, TenderResponses } from '../src/db/models';

dotenv.config();

/**
 * Fix responded products total price
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const responses = await TenderResponses.find({
        'respondedProducts.totalPrice': null,
        'respondedProducts.unitPrice': { $ne: null },
      });

      console.log(responses.length);

      for (const response of responses) {
        const tender = await Tenders.findOne({ _id: response.tenderId });
        const requestedProducts = tender.requestedProducts || [];

        const respondedProducts = [];

        for (const [index, product] of response.respondedProducts.entries()) {
          const requestedProduct = requestedProducts[index];

          respondedProducts.push({
            ...product.toJSON(),
            totalPrice: requestedProduct.quantity * product.unitPrice,
          });
        }

        await TenderResponses.update({ _id: response._id }, { $set: { respondedProducts } });
      }

      next();
    },
  );
};
