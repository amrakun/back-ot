/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Qualifications, Companies } from '../db/models';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from '../db/models/Companies';
import { companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateDoc = schema => {
  const doc = {};

  Object.keys(schema.paths).forEach((name, index) => {
    doc[name] = index % 2 === 0;
  });

  return doc;
};

describe('Valiation db', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Qualifications.remove({});
    await Companies.remove({});
  });

  test('Financial info', async () => {
    const doc = generateDoc(FinancialInfoSchema);

    const savedObject = await Qualifications.updateSection(_company._id, 'financialInfo', doc);

    expect(savedObject.financialInfo.toJSON()).toEqual(doc);
  });

  test('Business info', async () => {
    const doc = generateDoc(BusinessInfoSchema);

    const savedObject = await Qualifications.updateSection(_company._id, 'businessInfo', doc);

    expect(savedObject.businessInfo.toJSON()).toEqual(doc);
  });

  test('Environmental info', async () => {
    const doc = generateDoc(EnvironmentalInfoSchema);

    const savedObject = await Qualifications.updateSection(_company._id, 'environmentalInfo', doc);

    expect(savedObject.environmentalInfo.toJSON()).toEqual(doc);
  });

  test('Health info', async () => {
    const doc = generateDoc(HealthInfoSchema);

    const savedObject = await Qualifications.updateSection(_company._id, 'healthInfo', doc);

    expect(savedObject.healthInfo.toJSON()).toEqual(doc);
  });
});
