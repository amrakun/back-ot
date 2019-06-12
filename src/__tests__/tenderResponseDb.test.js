/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tenders, TenderResponses, Companies } from '../db/models';
import { tenderFactory, tenderResponseFactory, companyFactory, userFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const toObject = data => {
  return JSON.parse(JSON.stringify(data));
};

describe('Tender response db', () => {
  let _company;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
    await TenderResponses.remove({});
    await Companies.remove({});
  });

  const respondedProducts = [
    {
      code: 'code',
      suggestedManufacturer: 'suggestedManufacturer',
      suggestedManufacturerPartNumber: '10',
      unitPrice: 10000,
      totalPrice: 10000,
      leadTime: 10,
      comment: 'comment',
      file: { name: 'file', url: 'url' },
    },
  ];

  const respondedDocuments = [
    {
      name: 'name',
      isSubmitted: true,
      notes: 'notes',
      file: { name: 'file', url: 'url' },
    },
  ];

  test('Create tender response', async () => {
    expect(await TenderResponses.find().count()).toBe(0);

    const tender = await tenderFactory({ status: 'open', supplierIds: [_company._id] });

    const tenderResponseObj = await TenderResponses.createTenderResponse({
      tenderId: tender._id,
      supplierId: _company._id,
      respondedProducts,
      respondedDocuments,
    });

    expect(tenderResponseObj).toBeDefined();
    expect(tenderResponseObj.createdDate).toBeDefined();
    expect(tenderResponseObj.tenderId.toString()).toBe(tender._id.toString());
    expect(tenderResponseObj.supplierId.toString()).toBe(_company._id.toString());
    expect(tenderResponseObj.isNotInterested).toBe(false);

    expect(toObject(tenderResponseObj.respondedProducts)).toEqual(respondedProducts);
    expect(toObject(tenderResponseObj.respondedDocuments)).toEqual(respondedDocuments);

    // check duplications
    const response = await TenderResponses.createTenderResponse({
      tenderId: tender._id,
      supplierId: _company._id,
      respondedProducts,
    });

    expect(await TenderResponses.find().count()).toBe(1);

    expect(response.isSent).toBe(false);
  });

  test('Create tender response: with not open status', async () => {
    expect.assertions(1);

    const tender = await tenderFactory({ status: 'draft', isToAll: true });

    try {
      await TenderResponses.createTenderResponse({ tenderId: tender._id });
    } catch (e) {
      expect(e.message).toBe('This tender is not available');
    }
  });

  test('Create tender response: not participated', async () => {
    expect.assertions(1);

    const tender = await tenderFactory({ status: 'open' });

    try {
      await TenderResponses.createTenderResponse({
        tenderId: tender._id,
        supplierId: _company._id,
      });
    } catch (e) {
      expect(e.message).toBe('Not participated');
    }
  });

  test('Send', async () => {
    const tender = await tenderFactory({ status: 'open', isToAll: true });

    let tenderResponse = await tenderResponseFactory({ tenderId: tender._id });
    await Tenders.update({ _id: tender._id }, { $set: { status: 'canceled' } });

    expect(tenderResponse.isSent).toBe(false);

    try {
      await tenderResponse.send();
    } catch (e) {
      expect(e.message).toBe('This tender is not available');
    }

    // successfull ======================
    await Tenders.update({ _id: tender._id }, { $set: { status: 'open' } });

    await tenderResponse.send();

    tenderResponse = await TenderResponses.findOne({ _id: tenderResponse._id });

    expect(tenderResponse.sentDate).toBeDefined();
    expect(tenderResponse.isSent).toBe(true);
  });

  test('Send: EOI with late status', async () => {
    const tender = await tenderFactory({ type: 'eoi', status: 'open', isToAll: true });
    const tenderResponse = await tenderResponseFactory({ tenderId: tender._id });

    await Tenders.update({ _id: tender._id }, { $set: { status: 'closed' } });

    await tenderResponse.send();

    const response = await TenderResponses.findOne({ _id: tenderResponse._id });

    expect(response.status).toBe('late');
    expect(response.isSent).toBe(true);
  });

  test('Edit tender response: only supplier user can edit', async () => {
    expect.assertions(1);

    const tender = await tenderFactory({ status: 'open', isToAll: true });
    const response = await tenderResponseFactory({ tenderId: tender._id });
    const hackingSupplier = await companyFactory({});

    try {
      await TenderResponses.updateTenderResponse({
        tenderId: response.tenderId,
        supplierId: hackingSupplier._id,
      });
    } catch (e) {
      expect(e.message).toBe('Response not found');
    }
  });

  test('Edit tender response', async () => {
    const tender = await tenderFactory({ status: 'open', isToAll: true });
    const response = await tenderResponseFactory({ tenderId: tender._id });

    await Tenders.update({ _id: response.tenderId }, { $set: { status: 'closed' } });

    expect.assertions(4);

    // tender is closed or canceled
    try {
      await TenderResponses.updateTenderResponse({
        tenderId: response.tenderId,
        supplierId: response.supplierId,
      });
    } catch (e) {
      expect(e.message).toBe('This tender is not available');
    }

    // successful ==========
    await Tenders.update({ _id: response.tenderId }, { $set: { status: 'open' } });

    const doc = {
      tenderId: response.tenderId,
      supplierId: response.supplierId,
      respondedProducts: [
        {
          code: 'code',
          suggestedManufacturer: 'suggestedManufacturer',
          suggestedManufacturerPartNumber: '10',
          unitPrice: 10000,
          totalPrice: 10000,
          leadTime: 10,
          comment: 'comment',
          file: { name: 'file', url: 'url' },
        },
      ],

      respondedDocuments: [
        {
          name: 'name',
          isSubmitted: true,
          notes: 'notes',
          file: { name: 'file', url: 'url' },
        },
      ],
    };

    const updatedResponse = await TenderResponses.updateTenderResponse(doc);

    expect(updatedResponse.supplierId).toEqual(doc.supplierId);
    expect(toObject(updatedResponse.respondedProducts)).toEqual(doc.respondedProducts);
    expect(toObject(updatedResponse.respondedDocuments)).toEqual(doc.respondedDocuments);
  });

  test('Check file permission', async () => {
    const supplier1 = await userFactory({ isSupplier: true });
    const supplier2 = await userFactory({ isSupplier: true });
    const buyer = await userFactory({});

    const tender = await tenderFactory({ isToAll: true });
    await Tenders.update({ _id: tender._id }, { $set: { status: 'open' } });

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier1.companyId,
      respondedDocuments: [
        { file: { url: 's1_rd1.png', name: '/s1_rd1' } },
        { file: { url: 's1_rd2.png', name: '/s1_rd2' } },
      ],
      respondedProducts: [
        { file: { url: 's1_rp1.png', name: '/s1_rp1' } },
        { file: { url: 's1_rp2.png', name: '/s1_rp2' } },
      ],
      respondedFiles: [
        { url: 's1_rs1.png', name: '/s1_rs1' },
        { url: 's1_rs2.png', name: '/s1_rs2' },
      ],
    });

    // buyer can download all files
    expect(await TenderResponses.isAuthorizedToDownload('s1_rd1.png', buyer)).toBe(true);

    // responded documents ============================
    expect(await TenderResponses.isAuthorizedToDownload('s1_rd1.png', supplier1)).toBe(true);

    // not existing file
    expect(await TenderResponses.isAuthorizedToDownload('s1_rd3.png', supplier1)).toBe(false);

    // second supplier can not download
    expect(await TenderResponses.isAuthorizedToDownload('s1_rd1.png', supplier2)).toBe(false);

    // responded products ============================
    expect(await TenderResponses.isAuthorizedToDownload('s1_rp1.png', supplier1)).toBe(true);
    expect(await TenderResponses.isAuthorizedToDownload('s1_rp2.png', supplier1)).toBe(true);

    // second supplier can not download
    expect(await TenderResponses.isAuthorizedToDownload('s1_rp1.png', supplier2)).toBe(false);

    // responded service files ============================
    expect(await TenderResponses.isAuthorizedToDownload('s1_rs1.png', supplier1)).toBe(true);
    expect(await TenderResponses.isAuthorizedToDownload('s1_rs2.png', supplier1)).toBe(true);

    // second supplier can not download
    expect(await TenderResponses.isAuthorizedToDownload('s1_rs1.png', supplier2)).toBe(false);
  });

  test('Create tender response: not sent registration info', async () => {
    expect.assertions(1);

    const supplier = await companyFactory({ isSentRegistrationInfo: false });

    const tender = await tenderFactory({ status: 'open', supplierIds: [supplier._id] });

    try {
      await TenderResponses.createTenderResponse({
        tenderId: tender._id,
        supplierId: supplier._id,
      });
    } catch (e) {
      expect(e.message).toBe('Please complete registration stage');
    }
  });

  test('Create tender response: not sent prequalification info', async () => {
    expect.assertions(1);

    const supplier = await companyFactory({ isSentPrequalificationInfo: false });

    const tender = await tenderFactory({
      type: 'eoi',
      status: 'open',
      supplierIds: [supplier._id],
    });

    try {
      await TenderResponses.createTenderResponse({
        tenderId: tender._id,
        supplierId: supplier._id,
      });
    } catch (e) {
      expect(e.message).toBe('Please complete prequalification stage');
    }
  });
});
