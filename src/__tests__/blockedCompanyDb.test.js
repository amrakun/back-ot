/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, BlockedCompanies } from '../db/models';
import { userFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('BlockedCompany db', () => {
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
  });

  test('base', async () => {
    const doc = {
      supplierId: 'DFAFSFD',
      startDate: new Date(),
      endDate: new Date(),
      note: 'note',
    };

    // block a company =================
    const object = await BlockedCompanies.block(doc, _user._id);

    let count = await BlockedCompanies.find({}).count();
    expect(count).toBe(1);

    expect(object.supplierId).toEqual(doc.supplierId);
    expect(object.startDate).toEqual(doc.startDate);
    expect(object.endDate).toEqual(doc.endDate);
    expect(object.note).toEqual(doc.note);
    expect(object.createdUserId).toEqual(_user._id);

    // unblock a company =================
    await BlockedCompanies.unblock(object.supplierId);

    count = await BlockedCompanies.find({}).count();
    expect(count).toBe(0);
  });
});
