/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Tenders } from '../db/models';
import dbUtils from '../db/models/utils';
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
    const createdDate = tenderObj.createdDate;
    const createdUserId = tenderObj.createdUserId;

    tenderObj = JSON.parse(JSON.stringify(tenderObj));

    delete tenderObj._id;
    delete tenderObj.__v;
    delete tenderObj.createdDate;
    delete tenderObj.createdUserId;
    delete tenderObj.status;

    expect(tenderObj).toEqual(_tender);
    expect(createdDate).toBeDefined();
    expect(createdUserId).toEqual(_user._id);
    expect(status).toEqual('draft');
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

  test('Update tender: with open status', async () => {
    const tender = await tenderFactory({ status: 'open' });

    expect.assertions(1);

    try {
      await Tenders.updateTender(tender._id, {});
    } catch (e) {
      expect(e.message).toBe('Can not update open or closed tender');
    }
  });

  test('Delete tender', async () => {
    await Tenders.removeTender(_tender._id);

    expect(await Tenders.find({ _id: _tender._id }).count()).toBe(0);
  });

  test('Delete tender: with open status', async () => {
    expect.assertions(2);

    const tender = await tenderFactory({ status: 'open' });

    try {
      await Tenders.removeTender(tender._id);
    } catch (e) {
      expect(e.message).toBe('Can not delete open or closed tender');
    }

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
    // mocking datetime now
    dbUtils.getNow = jest.fn(() => new Date('2040-02-01 01:01'));

    let tender1 = await tenderFactory({ publishDate: new Date('2040-02-01 01:00') });
    let tender2 = await tenderFactory({ publishDate: new Date('2040-02-02') });

    await Tenders.publishDrafts();

    tender1 = await Tenders.findOne({ _id: tender1._id });
    tender2 = await Tenders.findOne({ _id: tender2._id });

    expect(tender1.status).toBe('open');
    expect(tender2.status).toBe('draft');
  });

  test('Close opens', async () => {
    // mocking datetime now
    dbUtils.getNow = jest.fn(() => new Date('2018/01/20 17:11'));

    let tender1 = await tenderFactory({ status: 'open', closeDate: new Date('2018/01/20 17:10') });
    let tender2 = await tenderFactory({ status: 'open', closeDate: new Date('2018/01/20 17:12') });

    await Tenders.closeOpens();

    tender1 = await Tenders.findOne({ _id: tender1._id });
    tender2 = await Tenders.findOne({ _id: tender2._id });

    expect(tender1.status).toBe('closed');
    expect(tender2.status).toBe('open');
  });

  test('Send regret letter', async () => {
    expect.assertions(4);

    let tender = await Tenders.findOne({ _id: _tender._id });

    expect(tender.sentRegretLetter).toBe(false);

    // try not awarded
    try {
      await tender.sendRegretLetter();
    } catch (e) {
      expect(e.message).toBe('Not awarded');
    }

    await tender.update({ winnerId: 'DFAFFADSF' });
    tender = await Tenders.findOne({ _id: tender._id });

    await tender.sendRegretLetter();

    const updatedTender = await Tenders.findOne({ _id: tender._id });

    expect(updatedTender.sentRegretLetter).toBe(true);

    // try to resend
    try {
      await updatedTender.sendRegretLetter();
    } catch (e) {
      expect(e.message).toBe('Already sent');
    }
  });
});
