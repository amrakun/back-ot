import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Companies } from '../src/db/models';
import { generateSearchText } from '../src/db/models/utils';

dotenv.config();

/**
 * Generate search text fields
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const companies = await Companies.find({});

      for (const company of companies) {
        if (!company.basicInfo) {
          continue;
        }

        const searchText = generateSearchText(company);

        await Companies.updateOne({ _id: company._id }, { $set: { searchText } });
      }

      next();
    },
  );
};

module.exports.down = next => {
  next();
};
