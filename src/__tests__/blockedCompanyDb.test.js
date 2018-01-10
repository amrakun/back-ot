/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { BlockedCompanies } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('BlockedCompany db', () => {
  test('base', async () => {
    const doc = {
      supplierId: 'DFAFSFD',
      startDate: new Date(),
      endDate: new Date(),
      note: 'note',
    };

    // block a company =================
    const object = await BlockedCompanies.block(doc);

    let count = await BlockedCompanies.find({}).count();
    expect(count).toBe(1);

    expect(object.supplierId).toEqual(doc.supplierId);
    expect(object.startDate).toEqual(doc.startDate);
    expect(object.endDate).toEqual(doc.endDate);
    expect(object.note).toEqual(doc.note);

    // unblock a company =================
    await BlockedCompanies.unblock(object._id);

    count = await BlockedCompanies.find({}).count();
    expect(count).toBe(0);
  });
});
