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

const generateDoc = (schema, qualified) => {
  const doc = {};

  Object.keys(schema.paths).forEach((name, index) => {
    doc[name] = qualified || index % 2 === 0;
  });

  return doc;
};

describe('Qualification db', () => {
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
    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(savedObject.financialInfo.toJSON()).toEqual(doc);
    expect(updatedCompany.isPrequalified).toBe(false);
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

  test('Pre qualified status', async () => {
    const financialDoc = generateDoc(FinancialInfoSchema, true);
    const businessDoc = generateDoc(BusinessInfoSchema, true);
    const environmentalDoc = generateDoc(EnvironmentalInfoSchema, true);
    const healthDoc = generateDoc(HealthInfoSchema, true);

    await Qualifications.updateSection(_company._id, 'financialInfo', financialDoc);
    await Qualifications.updateSection(_company._id, 'businessInfo', businessDoc);
    await Qualifications.updateSection(_company._id, 'environmentalInfo', environmentalDoc);
    await Qualifications.updateSection(_company._id, 'healthInfo', healthDoc);

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isPrequalified).toBe(true);
  });

  test('Tier type', async () => {
    const qualif = await Qualifications.saveTierType(_company._id, 'tierType', 'national');

    expect(qualif.tierType).toBe('national');

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.tierType).toBe('national');
  });
});
