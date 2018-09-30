/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderResponses } from '../db/models';
import dbUtils from '../db/models/utils';
import {
  userFactory,
  companyFactory,
  tenderFactory,
  tenderDoc,
  tenderResponseFactory,
} from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const flatten = tender => JSON.parse(JSON.stringify(tender));

const compare = (o1, o2) => {
  expect(o1.number).toBe(o2.number);
  expect(o1.name).toBe(o2.name);
  expect(o1.content).toBe(o2.content);
  expect(o1.attachments.toString()).toBe(o2.attachments.toString());
  expect(o1.publishDate).toBe(o2.publishDate);
  expect(o1.closeDate).toBe(o2.closeDate);
  expect(o1.file.toString()).toBe(o2.file.toString());
  expect(o1.sourcingOfficer).toBe(o2.sourcingOfficer);
  expect(o1.reminderDay).toBe(o2.reminderDay);

  if (o1.requestedProducts || o2.requestedProducts) {
    expect(o1.requestedProducts.toString()).toBe(o2.requestedProducts.toString());
  }

  if (o1.requestedDocuments || o2.requestedDocuments) {
    expect(o1.requestedDocuments.toString()).toBe(o2.requestedDocuments.toString());
  }
};

describe('Tender db', () => {
  let _tender;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory({ attachments: [{ name: 'name', url: 'url' }] });
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
    await Users.remove({});
  });

  test('Create tender: open status', async () => {
    const doc = await tenderDoc({ type: 'rfq' });

    const savedTender = await Tenders.createTender(doc, _user._id);

    const { status, createdDate, createdUserId } = savedTender;

    compare(flatten(doc), flatten(savedTender));

    expect(savedTender.getSupplierIds()).toEqual(doc.supplierIds);
    expect(createdDate).toBeDefined();
    expect(createdUserId).toEqual(_user._id);
    expect(status).toEqual('draft');
  });

  test('Update tender', async () => {
    const doc = await tenderDoc();

    const updated = await Tenders.updateTender(_tender._id, { ...doc });

    compare(flatten(doc), flatten(updated));

    expect(updated.getSupplierIds()).toEqual(doc.supplierIds);
  });

  test('Update tender: with closed status', async () => {
    const tender = await tenderFactory({ status: 'closed' });
    const doc = await tenderDoc();

    expect.assertions(1);

    try {
      await Tenders.updateTender(tender._id, doc);
    } catch (e) {
      expect(e.message).toBe('Can not update closed tender');
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
    expect.assertions(6);

    const tender = await tenderFactory({ status: 'open' });

    expect(tender.winnerIds.length).toBe(0);

    // can not award not responded supplier ===============
    try {
      await Tenders.award(tender._id, ['DFAFDSFDSF']);
    } catch (e) {
      expect(e.message).toBe('Invalid supplier');
    }

    // can not award not interested supplier ===============
    const supplier = await companyFactory();

    const response = await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier._id,
      isNotInterested: true,
    });

    try {
      await Tenders.award(tender._id, [supplier._id]);
    } catch (e) {
      expect(e.message).toBe('Invalid supplier');
    }

    // valid =============
    await TenderResponses.update({ _id: response._id }, { $set: { isNotInterested: false } });
    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier._id,
      isNotInterested: false,
    });

    const updatedTender = await Tenders.award(tender._id, [supplier._id]);

    expect(updatedTender.status).toBe('awarded');
    expect(updatedTender.winnerIds.length).toBe(1);
    expect(updatedTender.winnerIds).toContain(supplier._id);
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

    let tender1 = await tenderFactory({
      status: 'open',
      closeDate: new Date('2018/01/20 17:10'),
    });

    let tender2 = await tenderFactory({
      status: 'open',
      closeDate: new Date('2018/01/20 17:12'),
    });

    await Tenders.closeOpens();

    tender1 = await Tenders.findOne({ _id: tender1._id });
    tender2 = await Tenders.findOne({ _id: tender2._id });

    expect(tender1.status).toBe('closed');
    expect(tender2.status).toBe('open');
  });

  test('tenders to remind', async () => {
    dbUtils.getNow = jest.fn(() => new Date());

    await tenderFactory({
      status: 'open',
      reminderDay: 3,
      closeDate: moment().add(10, 'days'),
    });

    await tenderFactory({
      status: 'open',
      reminderDay: 3,
      closeDate: moment().add(3, 'days'),
    });

    const tenders = await Tenders.tendersToRemind();

    expect(tenders.length).toBe(1);
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

    await tender.update({ winnerIds: ['DFAFFADSF'] });
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

  test('Cancel', async () => {
    expect.assertions(2);

    let tender = await tenderFactory({ status: 'closed' });

    tender = await Tenders.findOne({ _id: tender._id });

    try {
      await tender.cancel();
    } catch (e) {
      expect(e.message).toBe('This tender is closed');
    }

    // successfull ===========================
    await Tenders.update({ _id: tender._id }, { $set: { status: 'open' } });

    tender = await Tenders.findOne({ _id: tender._id });

    await tender.cancel();

    const updatedTender = await Tenders.findOne({ _id: tender._id });

    expect(updatedTender.status).toBe('canceled');
  });
});
