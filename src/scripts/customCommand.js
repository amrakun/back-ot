import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Users } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

  const users = await Users.find({});

  for (const user of users) {
    if (user.companyId) {
      await Users.update({ _id: user._id }, { $set: { companyId: user.companyId.toString() } });
    }
  }

  mongoose.connection.close();
};

customCommand();
