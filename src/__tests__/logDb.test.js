/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { SuppliersByProductCodeLogs, Companies } from '../db/models';
import { companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('suppliers by product code logs', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
  });

  test('Create audit', async () => {
    // const user = await userFactory();
    _company.groupInfo = {
      factories: [
        {
          country: 'mn',
          productCodes: ['aaaa', 'bbbb', 'cccc', '1111'],
          townOrCity: 'Ulaanbaatar',
          name: 'Talkh chiher',
        },
      ],
      role: 'manufactorer',
    };

    let company = await Companies.findOne({ _id: _company._id });
    await company.update(_company);

    const log1a = await SuppliersByProductCodeLogs.createLog(_company);

    _company.groupInfo = {
      factories: [
        {
          country: 'mn',
          productCodes: ['aaaa2', 'bbbb2', 'cccc2', '11112'],
          townOrCity: 'Ulaanbaatar',
          name: 'Talkh chiher',
        },
      ],
      role: 'manufactorer',
    };

    const log2 = await SuppliersByProductCodeLogs.createLog(_company);

    const log1b = await SuppliersByProductCodeLogs.findOne({ _id: log1a._id });

    expect(log1b.startDate).toEqual(log1b.startDate);
    expect(log1a.endDate).toBeUndefined();
    expect(log1b.endDate != null).toBe(true);
    expect(log2.endDate).toBeUndefined();
    expect(await SuppliersByProductCodeLogs.find({}).count()).toBe(2);
  });
});
