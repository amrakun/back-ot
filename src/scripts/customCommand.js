import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Companies, Qualifications } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  mongoose.connect(
    process.env.MONGO_URL,
    { useMongoClient: true },
  );

  // update tier type
  await Companies.update(
    { tierType: 'umnugobi' },
    { $set: { tierType: 'umnugovi' } },
    { multi: true },
  );
  await Qualifications.update(
    { tierType: 'umnugobi' },
    { $set: { tierType: 'umnugovi' } },
    { multi: true },
  );

  mongoose.connection.close();
};

customCommand();
