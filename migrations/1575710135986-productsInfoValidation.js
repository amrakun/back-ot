import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Companies } from '../src/db/models';

dotenv.config();

/**
 * Fix products info validations
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const companies = await Companies.find(
        {
          validatedProductsInfo: { $exists: true, $ne: [] },
          isProductsInfoValidated: { $ne: true },
        },
        { validatedProductsInfo: 1 },
      );

      console.log('Count', companies.length);

      for (const company of companies) {
        if (company.validatedProductsInfo && company.validatedProductsInfo.length > 0) {
          await Companies.updateOne(
            { _id: company._id },
            { $set: { isProductsInfoValidated: true } },
          );
        }
      }

      next();
    },
  );
};
