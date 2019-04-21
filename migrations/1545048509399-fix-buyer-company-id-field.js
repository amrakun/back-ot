import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Users, Companies } from '../src/db/models';

dotenv.config();

/**
 * Added rfqType field
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const users = await Users.find({ isSupplier: false, companyId: { $exists: true } });

      for (const user of users) {
          if (!user.companyId) {
            continue;
          }

          const company = await Companies.findOne({ _id: user.companyId });

          await Users.update({ _id: user._id }, { $set: { companyId: null } });

          console.log(user.email, company.basicInfo);
      }

      next();
    },
  );
};
