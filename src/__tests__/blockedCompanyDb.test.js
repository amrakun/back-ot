/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { connect, disconnect } from '../db/connection';
import { Users, Companies, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('BlockedCompany db', () => {
  let _user;
  let _company;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await BlockedCompanies.remove({});
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
    let object = await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.find({}).count()).toBe(1);

    expect(object.supplierId).toEqual(doc.supplierId);
    expect(object.startDate).toEqual(doc.startDate);
    expect(object.endDate).toEqual(doc.endDate);
    expect(object.note).toEqual(doc.note);
    expect(object.createdUserId).toEqual(_user._id);

    // reblock =================
    doc.note = 'updated';
    object = await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.find({}).count()).toBe(1);
    expect(object.note).toEqual('updated');

    // unblock a company =================
    await BlockedCompanies.unblock(object.supplierId);

    expect(await BlockedCompanies.find({}).count()).toBe(0);
  });

  test('isBlocked', async () => {
    // true =================
    const today = moment().endOf('day');
    const tomorrow = moment()
      .add(1, 'day')
      .endOf('day');

    const doc = {
      supplierId: _company._id,
      startDate: today,
      endDate: tomorrow,
    };

    // block a company =================
    await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.find({}).count()).toBe(1);
    expect(await BlockedCompanies.isBlocked(_company._id)).toBe(true);

    // false =================
    doc.startDate = moment(today).subtract(2, 'days');
    doc.endDate = moment(today).subtract(1, 'days');

    // block a company =================
    await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.isBlocked(_company._id)).toBe(false);
  });

  test('blockedSupplierIds', async () => {
    const unblockedSupplier = await companyFactory();
    const blockedSupplier = await companyFactory();

    // in blockable range
    await BlockedCompanies.block(
      {
        supplierId: blockedSupplier._id,
        startDate: moment().endOf('day'), // today
        endDate: moment()
          .add(1, 'day')
          .endOf('day'), // tommorrow
      },
      _user._id,
    );

    // do not block until startDate
    await BlockedCompanies.block(
      {
        supplierId: unblockedSupplier._id,
        startDate: moment().add(2, 'day'), // 2 days after today
        endDate: moment()
          .add(4, 'day')
          .endOf('day'), // 4 days after today
      },
      _user._id,
    );

    const ids = await BlockedCompanies.blockedIds();

    expect(ids).toContain(blockedSupplier._id);
    expect(ids).not.toContain(unblockedSupplier._id);
  });
});
