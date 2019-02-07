import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Tenders } from '../src/db/models';

dotenv.config();

/**
 * Added rfqType field
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const tenders = await Tenders.find();

      for (const tender of tenders) {
        await Tenders.update({ _id: tender._id }, { $set: { updatedDate: tender.createdDate } });
      }

      next();
    },
  );
};
