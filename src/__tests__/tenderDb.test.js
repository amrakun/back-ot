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

  test('Create tender: rfq type', async () => {
    expect.assertions(1);

    try {
      await Tenders.createTender({
        type: 'rfq',
        rfqType: 'invalid',
        supplierIds: ['_id'],
      });
    } catch (e) {
      expect(e.message).toBe('Invalid rfq type');
    }
  });

  test('Create tender: required suppliers', async () => {
    expect.assertions(1);

    try {
      await Tenders.createTender({ supplierIds: [] });
    } catch (e) {
      expect(e.message).toBe('Suppliers are required');
    }
  });

  test('Validate suppliers', async () => {
    expect.assertions(4);

    let doc = { tierTypes: ['test', 'tier1'] };

    try {
      await Tenders.validateSuppliers(doc);
    } catch (e) {
      expect(e.message).toBe('Invalid tier type');
    }

    // if we selected tier types then supplierIds be resetted
    doc = { tierTypes: ['tier2', 'tier1'], supplierIds: ['_id'] };
    await Tenders.validateSuppliers(doc);
    expect(doc.supplierIds).toEqual([]);

    // if we selected all then tierTypes, supplierIds be resetted
    doc = { isToAll: true, tierTypes: ['tier2', 'tier1'], supplierIds: ['_id'] };
    await Tenders.validateSuppliers(doc);
    expect(doc.tierTypes).toEqual([]);
    expect(doc.supplierIds).toEqual([]);
  });

  test('Update tender', async () => {
    const doc = await tenderDoc();

    const updated = await Tenders.updateTender(_tender._id, { ...doc });

    compare(flatten(doc), flatten(updated));

    expect(updated.getSupplierIds()).toEqual(doc.supplierIds);
  });

  test('Update tender: with awarded status', async () => {
    const tender = await tenderFactory({ status: 'awarded' });
    const doc = await tenderDoc();

    expect.assertions(1);

    try {
      await Tenders.updateTender(tender._id, doc);
    } catch (e) {
      expect(e.message).toBe('Can not update awarded tender');
    }
  });

  test('Update tender: with closed status', async () => {
    const tender = await tenderFactory({ status: 'open' });

    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    await Tenders.update({ _id: tender._id }, { $set: { status: 'closed' } });

    const doc = await tenderDoc();
    const updated = await Tenders.updateTender(tender._id, doc);

    expect(updated.status).toBe('draft');

    // responses's sent status must be resetted
    const [response1, response2] = await TenderResponses.find({ tenderId: tender._id });

    expect(response1.isSent).toBe(false);
    expect(response2.isSent).toBe(false);
  });

  test('Update tender: with canceled status', async () => {
    const tender = await tenderFactory({ status: 'canceled' });
    const doc = await tenderDoc();

    const updated = await Tenders.updateTender(tender._id, doc);

    expect(updated.status).toBe('draft');
  });

  test('Update open tender & no requirements changed', async () => {
    const tender = await tenderFactory({ status: 'open' });
    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    const doc = { ...tender.toJSON(), supplierIds: tender.getSupplierIds() };

    await Tenders.updateTender(tender._id, doc);

    // responses's sent status must be intact
    const [response1, response2] = await TenderResponses.find({ tenderId: tender._id });

    expect(response1.isSent).toBe(true);
    expect(response2.isSent).toBe(true);
  });

  test('Update closed tender & no requirements changed', async () => {
    const tender = await tenderFactory({ status: 'open' });

    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    await Tenders.update({ _id: tender._id }, { $set: { status: 'closed' } });

    const doc = { ...tender.toJSON(), supplierIds: tender.getSupplierIds() };

    await Tenders.updateTender(tender._id, doc);

    // responses's sent status must be intact
    const [response1, response2] = await TenderResponses.find({ tenderId: tender._id });

    expect(response1.isSent).toBe(true);
    expect(response2.isSent).toBe(true);
  });

  test('Update tender: open tender supplierIds update', async () => {
    expect.assertions(4);

    const supplier1 = await companyFactory({});
    const supplier2 = await companyFactory({});
    const supplier3 = await companyFactory({});

    const tender = await tenderFactory({
      status: 'open',
      supplierIds: [supplier1._id, supplier2._id],
    });

    const response1 = await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    const response2 = await tenderResponseFactory({ tenderId: tender._id, isSent: true });

    try {
      const doc = await tenderDoc({ supplierIds: [supplier1._id] });
      await Tenders.updateTender(tender._id, doc);
    } catch (e) {
      expect(e.message).toBe('Can not remove previously added supplier');
    }

    const doc = await tenderDoc({ supplierIds: [supplier1._id, supplier2._id, supplier3._id] });
    const updated = await Tenders.updateTender(tender._id, doc);

    expect(updated.getSupplierIds()).toEqual([supplier1._id, supplier2._id, supplier3._id]);

    // sent responses must be resetted to not send =====
    const updatedResponse1 = await TenderResponses.findOne({ _id: response1._id });
    const updatedResponse2 = await TenderResponses.findOne({ _id: response2._id });

    expect(updatedResponse1.isSent).toBe(false);
    expect(updatedResponse2.isSent).toBe(false);
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
    expect.assertions(9);

    const tender = await tenderFactory({ status: 'open' });

    expect(tender.winnerIds.length).toBe(0);

    // select at least one supplier ===============
    try {
      await Tenders.award({ _id: tender._id, supplierIds: [] });
    } catch (e) {
      expect(e.message).toBe('Select some suppliers');
    }

    // can not award not responded supplier ===============
    try {
      await Tenders.award({ _id: tender._id, supplierIds: ['DFAFDSFDSF'] });
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
      await Tenders.award({ _id: tender._id, supplierIds: [supplier._id] });
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

    const attachments = [
      {
        supplierId: supplier._id,
        attachment: { name: 'name1', url: '/url1' },
      },
    ];

    const updatedTender = await Tenders.award({
      _id: tender._id,
      supplierIds: [supplier._id],
      note: 'note',
      attachments,
    });

    expect(updatedTender.status).toBe('awarded');
    expect(updatedTender.awardNote).toBe('note');
    expect(updatedTender.awardAttachments.toObject()).toEqual(attachments);
    expect(updatedTender.winnerIds.length).toBe(1);
    expect(updatedTender.getWinnerIds()).toContain(supplier._id);
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
      expect(e.message).toBe('Can not cancel awarded or closed tender');
    }

    // successfull ===========================
    await Tenders.update({ _id: tender._id }, { $set: { status: 'open' } });

    tender = await Tenders.findOne({ _id: tender._id });

    await tender.cancel();

    const updatedTender = await Tenders.findOne({ _id: tender._id });

    expect(updatedTender.status).toBe('canceled');
  });

  test('Check file permission', async () => {
    const supplier1 = await userFactory({ isSupplier: true });
    const supplier2 = await userFactory({ isSupplier: true });
    const supplier3 = await userFactory({ isSupplier: true });

    const buyer = await userFactory({});

    await tenderFactory({
      supplierIds: [supplier1.companyId, supplier2.companyId],
      file: { url: 'f1.png', name: '/f1' },
      attachments: [
        { url: 'attach10.png', name: '/attach10' },
        { url: 'attach2.png', name: '/attach2' },
        { url: 'attach4.png', name: '/attach4' },
      ],
    });

    // buyer can download all files
    expect(await Tenders.isAuthorizedToDownload('f1.png', buyer)).toBe(true);

    // Only invited suppliers can download
    expect(await Tenders.isAuthorizedToDownload('f1.png', supplier3)).toBe(false);

    expect(await Tenders.isAuthorizedToDownload('f1.png', supplier1)).toBe(true);
    expect(await Tenders.isAuthorizedToDownload('f1.png', supplier2)).toBe(true);
    expect(await Tenders.isAuthorizedToDownload('f2.png', supplier2)).toBe(false);

    expect(await Tenders.isAuthorizedToDownload('attach10.png', supplier1)).toBe(true);
    expect(await Tenders.isAuthorizedToDownload('attach2.png', supplier2)).toBe(true);
    expect(await Tenders.isAuthorizedToDownload('attach4.png', supplier2)).toBe(true);
  });

  test('isChanged', async () => {
    const tender = await tenderFactory({
      requestedProducts: [
        {
          code: 'code',
          purchaseRequestNumber: 10000,
          shortText: 'desc',
          quantity: 1,
          uom: 'mnt',
          manufacturer: 'man',
          manufacturerPartNumber: 'number',
        },
      ],
    });

    const doc = tender.toJSON();

    expect(await tender.isChanged(doc)).toBe(false);
    expect(await tender.isChanged({ ...doc, content: 'content' })).toBe(true);
    expect(await tender.isChanged({ ...doc, number: 'number' })).toBe(true);
    expect(await tender.isChanged({ ...doc, name: 'name' })).toBe(true);
    expect(await tender.isChanged({ ...doc, sourcingOfficer: 'sourcingOfficer' })).toBe(true);
    expect(await tender.isChanged({ ...doc, publishDate: new Date('2000-01-01') })).toBe(false);
    expect(await tender.isChanged({ ...doc, closeDate: new Date('2000-01-01') })).toBe(false);
    expect(await tender.isChanged({ ...doc, requestedDocuments: ['d1', 'd2'] })).toBe(true);
    expect(await tender.isChanged({ ...doc, requestedProducts: [{ code: '1' }] })).toBe(true);
  });
});
