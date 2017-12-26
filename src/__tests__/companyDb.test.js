/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Companies } from '../db/models';
import { userFactory, companyFactory, companyDocs } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Companies model tests', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
  });

  const toObject = data => {
    return JSON.parse(JSON.stringify(data));
  };

  const checkSection = async name => {
    const company = await companyFactory();
    const doc = companyDocs[name]();
    const updatedCompany = await Companies.updateSection(company._id, `${name}Info`, doc);

    expect(toObject(updatedCompany[`${name}Info`])).toEqual(doc);
  };

  test('Create', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id);

    expect(company).toBeDefined();
    expect(company._id).toBeDefined();

    const updatedUser = await Users.findOne({ _id: user._id });

    expect(updatedUser.companyId).toEqual(company._id);
  });

  test('Update basic info: validations', async () => {
    expect.assertions(2);

    const company = await companyFactory();

    // duplicate english company name
    try {
      await Companies.updateBasicInfo(company._id, { enName: _company.enName });
    } catch (e) {
      expect(e.message).toBe('Duplicated english name');
    }

    // duplicate mongolian company name
    try {
      await Companies.updateBasicInfo(company._id, { enName: 'enName', mnName: _company.mnName });
    } catch (e) {
      expect(e.message).toBe('Duplicated mongolian name');
    }
  });

  test('Update basic info: valid', async () => {
    await checkSection('basic');
  });

  test('Update contact info', async () => {
    await checkSection('contact');
  });

  test('Update management team', async () => {
    await checkSection('managementTeam');
  });

  test('Update shareholder info', async () => {
    await checkSection('shareholder');
  });

  test('Update group info', async () => {
    await checkSection('group');
  });

  test('Update products info', async () => {
    await checkSection('products');
  });

  test('Update certificate info', async () => {
    await checkSection('certificate');
  });

  test('Update Financial Info', async () => {
    await checkSection('financial');
  });

  test('Update Business integrity and Human resource', async () => {
    await checkSection('business');
  });

  test('Update environmental management', async () => {
    await checkSection('environmental');
  });

  test('Update health and safety management system', async () => {
    await checkSection('health');
  });
});
