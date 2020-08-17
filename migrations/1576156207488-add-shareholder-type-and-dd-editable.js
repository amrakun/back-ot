import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Companies } from '../src/db/models';

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
        if (!company.shareholderInfo || !company.isSentRegistrationInfo) {
          continue;
        }

        const shareholderInfo = company.shareholderInfo.toJSON();

        shareholderInfo.shareholders = shareholderInfo.shareholders.map(item => {
          return { ...item, type: 'individual', firstName: item.name };
        });

        await Companies.updateOne(
          { _id: company._id },
          { $set: { shareholderInfo, isDueDiligenceEditable: false } },
        );
      }

      next();
    },
  );
};
