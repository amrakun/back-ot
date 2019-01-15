import mongoose from 'mongoose';
import dotenv from 'dotenv';
import faker from 'faker';
import moment from 'moment';
import { Users, Companies } from './db/models';
import {
  userFactory,
  companyFactory,
  tenderFactory,
  tenderResponseFactory,
  physicalAuditFactory,
} from './db/factories';

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

  // create tenders ================
  const suppliers = await Companies.find({});
  const supplierIds = suppliers.map(s => s._id);

  const tenderFigures = [
    { publishDate: '2028-02-02', times: 7, statusDuration: 2 },
    { publishDate: '2028-02-02', times: 10, statusDuration: 3 },
    { publishDate: '2028-02-03', times: 3, statusDuration: 2 },
    { publishDate: '2028-02-04', times: 9, statusDuration: 5 },
    { publishDate: '2028-02-05', times: 8, statusDuration: 4 },
    { publishDate: '2028-02-06', times: 7, statusDuration: 1 },
    { publishDate: '2028-02-07', times: 4, statusDuration: 2 },
    { publishDate: '2028-02-08', times: 8, statusDuration: 2 },
    { publishDate: '2028-02-09', times: 2, statusDuration: 2 },
    { publishDate: '2028-02-10', times: 1, statusDuration: 1 },
  ];

  const requestedProducts = [
    {
      code: 'product1',
      purchaseRequestNumber: 1,
      shortText: 'short text 1',
      quantity: 1,
      uom: 'uom1',
      manufacturer: 'manufacturer1',
      manufacturerPartNumber: 1,
    },
    {
      code: 'product2',
      purchaseRequestNumber: 2,
      shortText: 'short text 2',
      quantity: 2,
      uom: 'uom2',
      manufacturer: 'manufacturer2',
      manufacturerPartNumber: 2,
    },
  ];

  const respondedProducts = [
    {
      code: 'product1',
      suggestedManufacturer: 'suggestedManufacturer1',
      suggestedManufacturerPartNumber: 2,
      unitPrice: 100,
      totalPrice: 100,
      currency: 'USD',
      leadTime: 1,
      shippingTerms: 'shippingTerms1',
    },
    {
      code: 'product2',
      suggestedManufacturer: 'suggestedManufacturer2',
      suggestedManufacturerPartNumber: 2,
      unitPrice: 200,
      totalPrice: 200,
      currency: 'USD',
      leadTime: 2,
      shippingTerms: 'shippingTerms2',
    },
  ];

  const createTender = async ({ publishDate, status }) => {
    const tender = await tenderFactory({
      type: faker.random.boolean() ? 'rfq' : 'eoi',
      publishDate: moment(publishDate),
      closeDate: moment(publishDate).add(30, 'days'),
      status,
      supplierIds,
      requestedProducts,
    });

    // create responses
    for (let supplierId of supplierIds) {
      await tenderResponseFactory({
        tenderId: tender._id,
        supplierId,
        notInterested: faker.random.boolean(),
        isSent: true,
        respondedProducts,
      });
    }
  };

  for (const figure of tenderFigures) {
    let i = 0;

    while (i < figure.times) {
      await createTender({
        ...figure,
        status: i % figure.statusDuration === 0 ? 'open' : 'closed',
      });

      i++;
    }
  }

  await userFactory({
    isSupplier: true,
    email: 'chantsal1201@gmail.com',
  });

  for (let i = 0; i < 30; i++) {
    await physicalAuditFactory();
  }

  mongoose.connection.close();
};

importData();
