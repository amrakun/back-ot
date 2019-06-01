import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Companies } from '../src/db/models';

dotenv.config();

/**
 * Delete SDGSD suppliers
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      await Companies.update({ _id: '5bbad3ae5e57596aa156e469' }, { $set: { isDeleted: true } });

      next();
    },
  );
};
