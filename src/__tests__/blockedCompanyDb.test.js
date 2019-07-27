/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { connect, disconnect } from '../db/connection';
import { Users, Companies, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory, blockedCompanyFactory } from '../db/factories';

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
      groupId: 'DFAFSFD',
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
    const doc = {
      supplierId: _company._id,
      groupId: 'DFADFFASFD',
      startDate: moment().subtract(2, 'hours'),
      endDate: moment().add(2, 'hours'),
    };

    // block a company =================
    await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.find({}).count()).toBe(1);
    expect(await BlockedCompanies.isBlocked(_company._id)).toBe(true);

    // false =================
    doc.startDate = moment().subtract(2, 'hours');
    doc.endDate = moment().subtract(1, 'hours');

    // block a company =================
    await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.isBlocked(_company._id)).toBe(false);

    // true =================
    doc.startDate = new Date();
    doc.endDate = moment().add(1, 'hours');

    // block a company =================
    await BlockedCompanies.block(doc, _user._id);

    expect(await BlockedCompanies.isBlocked(_company._id)).toBe(true);

    // false =================
    doc.startDate = moment().add(1, 'days');
    doc.endDate = moment().add(2, 'days');

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
        groupId: 'FDSAFJDKFJDK',
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
        groupId: 'FMMMDSAFJDKFJDK',
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

  test('blockedSuppliersByGroupId', async () => {
    const range = {
      startDate: moment().endOf('day'), // today
      endDate: moment()
        .add(1, 'day')
        .endOf('day'), // tomorrow
      createdUserId: _user._id,
    };

    await blockedCompanyFactory({ ...range, groupId: '1' });
    await blockedCompanyFactory({ ...range, groupId: '1' });
    await blockedCompanyFactory({ ...range, groupId: '2' });
    await blockedCompanyFactory({ ...range, groupId: '2' });

    const response = await BlockedCompanies.blockedSuppliersByGroupId();

    expect(response.length).toBe(2);

    const [entity1, entity2] = response;

    expect(entity1.createdUser._id.toString()).toBe(_user._id);
    expect(entity2.createdUser._id.toString()).toBe(_user._id);

    expect(entity1.suppliers.length).toBe(2);
    expect(entity2.suppliers.length).toBe(2);
  });
});
