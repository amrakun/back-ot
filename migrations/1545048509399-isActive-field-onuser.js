import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Users } from '../src/db/models';

dotenv.config();

/**
 * Add isActive field on user
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      await Users.update({}, { $set: { isActive: true } }, { multi: true });

      next();
    },
  );
};
