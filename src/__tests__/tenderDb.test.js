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

  test('Create tender: open status', async () => {
    delete _tender._id;
    delete _tender.status;

    let tenderObj = await Tenders.createTender(_tender, _user._id);

    const status = tenderObj.status;
    const createdUserId = tenderObj.createdUserId;

    tenderObj = JSON.parse(JSON.stringify(tenderObj));

    delete tenderObj._id;
    delete tenderObj.__v;
    delete tenderObj.createdUserId;
    delete tenderObj.status;

    expect(tenderObj).toEqual(_tender);
    expect(createdUserId).toEqual(_user._id);
    expect(status).toEqual('open');
  });

  test('Create tender: draft status', async () => {
    delete _tender._id;
    _tender.publishDate = new Date('2040-10-10');

    const tenderObj = await Tenders.createTender(_tender, _user._id);

    expect(tenderObj.status).toEqual('draft');
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

    expect(updatedTender.status).toBe('awarded');
    expect(updatedTender.winnerId).toBe(supplierId);
  });

  test('Publish drafts', async () => {
    let tender1 = await tenderFactory({ publishDate: new Date() });
    let tender2 = await tenderFactory({ publishDate: new Date('2040-01-01') });

    await Tenders.publishDrafts();

    tender1 = await Tenders.findOne({ _id: tender1._id });
    tender2 = await Tenders.findOne({ _id: tender2._id });

    expect(tender1.status).toBe('open');
    expect(tender2.status).toBe('draft');
  });

  test('Close opens', async () => {
    let tender1 = await tenderFactory({ status: 'open', closeDate: new Date() });
    let tender2 = await tenderFactory({ status: 'open', closeDate: new Date('2040-01-01') });

    await Tenders.closeOpens();

    tender1 = await Tenders.findOne({ _id: tender1._id });
    tender2 = await Tenders.findOne({ _id: tender2._id });

    expect(tender1.status).toBe('closed');
    expect(tender2.status).toBe('open');
  });
});
