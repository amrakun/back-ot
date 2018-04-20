import mongoose from 'mongoose';
import dotenv from 'dotenv';
import faker from 'faker';
import { Users } from './db/models';
import { userFactory } from './db/factories';

dotenv.config();

mongoose.Promise = global.Promise;

export const importData = async () => {
  mongoose.connect(process.env.MONGO_URL, { useMongoClient: true }).then(() => {
    mongoose.connection.db.dropDatabase();
  });

  // create admin
  await Users.createUser({
    username: 'admin',
    password: 'admin123',
    isSupplier: false,
    role: 'admin',
    email: 'admin@ot.mn',
    firstName: faker.name.firstName(),
    lastName: faker.name.firstName(),
  });

  // create supplier
  await userFactory({ isSupplier: true, email: 'chantsal1201@gmail.com', password: '123' });

  mongoose.connection.close();
};

importData();
