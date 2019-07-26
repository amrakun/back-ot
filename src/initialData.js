import mongoose from 'mongoose';
import dotenv from 'dotenv';
import faker from 'faker';
import { Users } from './db/models';
import { userFactory, companyFactory } from './db/factories';

dotenv.config();

mongoose.Promise = global.Promise;

export const importData = async () => {
  mongoose
    .connect(
      process.env.MONGO_URL,
      { useMongoClient: true },
    )
    .then(() => {
      mongoose.connection.db.dropDatabase();
    });

  // create admin
  await Users.createUser({
    username: 'admin',
    password: 'Admin$123',
    isSupplier: false,
    role: 'admin',
    email: 'admin@ot.mn',
    firstName: faker.name.firstName(),
    lastName: faker.name.firstName(),
  });

  await userFactory({
    isSupplier: true,
    email: 'supplier@ot.mn',
  });

  // create suppliers =========================
  const companyFigures = [
    {
      createdDate: '2018-01-01',
      times: 7,
      prequalifiedDuration: 2,
      tierType: 'tier1',
    },
    {
      createdDate: '2018-01-02',
      times: 10,
      prequalifiedDuration: 3,
      tierType: 'tier2',
    },
    {
      createdDate: '2018-01-03',
      times: 3,
      prequalifiedDuration: 2,
      tierType: 'tier3',
    },
    {
      createdDate: '2018-01-04',
      times: 9,
      prequalifiedDuration: 5,
      tierType: 'tier1',
    },
    {
      createdDate: '2018-01-05',
      times: 8,
      prequalifiedDuration: 4,
      tierType: 'national',
    },
    {
      createdDate: '2018-01-06',
      times: 7,
      prequalifiedDuration: 1,
      tierType: 'umnugovi',
    },
    {
      createdDate: '2018-01-07',
      times: 4,
      prequalifiedDuration: 2,
      tierType: 'tier3',
    },
    {
      createdDate: '2018-01-08',
      times: 8,
      prequalifiedDuration: 2,
      tierType: 'umnugovi',
    },
    {
      createdDate: '2018-01-09',
      times: 2,
      prequalifiedDuration: 2,
      tierType: 'tier3',
    },
    {
      createdDate: '2018-01-10',
      times: 1,
      prequalifiedDuration: 1,
      tierType: 'umnugovi',
    },
  ];

  const createCompany = ({ tierType, createdDate, isPrequalified }) => {
    const doc = {
      averageDifotScore: 1,
      isProductsInfoValidated: true,
      isPrequalified,
      isSentRegistrationInfo: true,
      isSentPrequalificationInfo: true,
      productsInfo: ['a01001', 'a01002'],
      validatedProductsInfo: ['a01001', 'a01002'],
      createdDate,
      tierType,
    };

    return companyFactory(doc);
  };

  for (const figure of companyFigures) {
    let i = 0;

    while (i < figure.times) {
      await createCompany({
        ...figure,
        isPrequalified: i % figure.prequalifiedDuration === 0,
      });

      i++;
    }
  }

  mongoose.connection.close();
};

importData();
