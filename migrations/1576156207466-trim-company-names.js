import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Companies } from '../src/db/models';

dotenv.config();

/**
 * Trim names
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  const perform = async (company, fieldName) => {
    const value = company.basicInfo[fieldName];

    if (value) {
      const trimmed = value.trim();

      if (value !== trimmed) {
        console.log('updating .......');

        await Companies.updateOne(
          { _id: company._id },
          { $set: { [`basicInfo.${fieldName}`]: trimmed } },
        );
      }
    }
  };

  mongoose.connect(
    MONGO_URL,
    async () => {
      const companies = await Companies.find({ basicInfo: { $exists: true } });

      for (const company of companies) {
        if (!company.basicInfo) {
          continue;
        }

        await perform(company, 'enName');
        await perform(company, 'mnName');
      }

      next();
    },
  );
};

module.exports.down = next => {
  next();
};
