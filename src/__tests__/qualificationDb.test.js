/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { connect, disconnect } from '../db/connection';
import { Configs, Qualifications, Companies } from '../db/models';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from '../db/models/Companies';

import { configFactory, companyFactory, qualificationFactory } from '../db/factories';

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
    await Configs.remove({});
    await Qualifications.remove({});
    await Companies.remove({});
  });

  test('Financial info', async () => {
    const doc = generateDoc(FinancialInfoSchema);

    const savedObject = await Qualifications.updateSection(_company._id, 'financialInfo', doc);

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(savedObject.financialInfo.toJSON()).toEqual(doc);
    expect(updatedCompany.isPrequalified).not.toBeDefined();
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
    await Companies.update({ _id: _company._id }, { $set: { isPrequalified: true } });

    await Qualifications.prequalify(_company._id, false);

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isPrequalified).toBe(false);
    expect(updatedCompany.prequalifiedDate).toBeDefined();
    expect(updatedCompany.isPrequalificationInfoEditable).toBe(false);
  });

  test('Tier type', async () => {
    const qualif = await Qualifications.saveTierType(_company._id, 'tierType', 'national');

    expect(qualif.tierType).toBe('national');

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.tierType).toBe('national');
  });

  test('status', async () => {
    // supplier did not send qualification info
    let status = await Qualifications.status(_company._id);

    expect(status).toEqual({});

    // send qualification info but buyer did not send info
    await qualificationFactory({ supplierId: _company._id });
    await Companies.update({ _id: _company._id }, { $set: { isPrequalified: false } });

    status = await Qualifications.status(_company._id);
    expect(status).toEqual({ isFailed: true });

    // approved
    await Companies.update({ _id: _company._id }, { $set: { isPrequalified: true } });

    status = await Qualifications.status(_company._id);
    expect(status).toEqual({ isApproved: true });
  });

  test('reset prequalification status', async () => {
    const check = async duration => {
      await Configs.remove({});

      await configFactory({
        prequalificationDow: {
          duration,
          amount: 2,
        },
      });

      // ignore not prequalified suppliers ============
      const supplier = await companyFactory({ isPrequalified: false });

      let response = await Qualifications.resetPrequalification(supplier._id);

      expect(response).toBe('notPrequalified');

      // due date is not here ============
      await Companies.update(
        { _id: supplier._id },
        {
          isPrequalified: true,
          prequalifiedDate: new Date(),
        },
      );

      response = await Qualifications.resetPrequalification(supplier._id);

      expect(response).toBe('dueDateIsNotHere');

      // due date is here ============
      await Companies.update(
        { _id: supplier._id },
        {
          prequalifiedDate: moment().subtract(3, `${duration}s`),
        },
      );

      response = await Qualifications.resetPrequalification(supplier._id);

      expect(response.isPrequalified).toBe(false);
    };

    await check('year');
    await check('month');
    await check('day');
  });

  test('reset prequalification status: specific', async () => {
    // ignore not prequalified suppliers ============
    const supplier = await companyFactory({
      isPrequalified: true,
      prequalifiedDate: moment().subtract(3, 'years'),
    });

    await configFactory({
      specificPrequalificationDow: {
        supplierIds: [supplier._id],
        duration: 'year',
        amount: 2,
      },
    });

    const response = await Qualifications.resetPrequalification(supplier._id);

    expect(response.isPrequalified).toBe(false);
  });
});
