/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Tenders } from '../db/models';
import { userFactory, tenderFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender db', () => {
  let _tender;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
    await Users.remove({});
  });

  test('Create tender', async () => {
    delete _tender._id;

    let tenderObj = await Tenders.createTender(_tender, _user._id);

    const createdUserId = tenderObj.createdUserId;

    tenderObj = JSON.parse(JSON.stringify(tenderObj));
    delete tenderObj._id;
    delete tenderObj.__v;
    delete tenderObj.createdUserId;

    expect(tenderObj).toEqual(_tender);
    expect(createdUserId).toEqual(_user._id);
  });

  test('Update tender', async () => {
    const doc = await tenderFactory();
    delete doc._id;

    let tenderObj = await Tenders.updateTender(_tender._id, doc);

    tenderObj = JSON.parse(JSON.stringify(tenderObj));
    delete tenderObj._id;
    delete tenderObj.__v;
    tenderObj.publishDate = tenderObj.publishDate.toString();
    tenderObj.closeDate = tenderObj.closeDate.toString();

    expect(tenderObj).toEqual(doc);
  });

  test('Delete tender', async () => {
    await Tenders.removeTender(_tender._id);

    expect(await Tenders.find({ _id: _tender._id }).count()).toBe(0);
  });

  test('Award', async () => {
    expect(_tender.winnerId).toBe(undefined);

    const supplierId = 'DFAFDSFDSF';

    const updatedTender = await Tenders.award(_tender._id, supplierId);

    expect(updatedTender.winnerId).toBe(supplierId);
  });
});
