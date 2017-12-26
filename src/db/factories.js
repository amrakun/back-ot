/* eslint-disable no-underscore-dangle */

import faker from 'faker';

import { Companies, Users, Tenders } from './models';

const save = async object => {
  const savedObject = await object.save();

  const fixedObject = JSON.parse(JSON.stringify(savedObject));

  delete fixedObject.__v;

  return fixedObject;
};

export const companyFactory = (params = {}) => {
  const company = new Companies({
    enName: params.enName || faker.random.word(),
    mnName: params.mnName || faker.random.word(),
  });

  return company.save();
};

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.internet.userName(),
    role: params.role || 'contributor',
    details: {
      fullName: params.fullName || faker.random.word(),
      avatar: params.avatar || faker.image.imageUrl(),
    },
    email: params.email || faker.internet.email(),
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isSupplier: params.isSupplier || false,
  });

  return save(user);
};

export const tenderFactory = async (params = {}) => {
  const requestedProduct = {
    purchaseRequestNumber: faker.random.number(),
    shortText: faker.random.word(),
    quantity: faker.random.number(),
    uom: faker.random.word(),
    manufacturer: faker.random.word(),
    manufacturerPartNumber: faker.random.number(),
  };

  const tender = new Tenders({
    type: params.type || 'rfq',
    number: params.number || faker.random.number(),
    name: params.number || faker.random.word(),
    content: params.content || faker.random.word(),
    publishDate: params.publishDate || new Date(),
    closeDate: params.closeDate || new Date(),
    reminderDay: params.reminderDay || faker.random.number(),
    file: params.file || { name: 'name', url: 'url' },
    supplierIds: params.supplierIds || ['id1', 'id2'],
    requestedProducts: params.requestedProducts || [requestedProduct],
    requestedDocuments: params.requestedDocuments || ['Document1'],
  });

  return save(tender);
};
