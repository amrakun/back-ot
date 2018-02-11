/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tenders, TenderResponses, Companies } from '../db/models';
import { tenderFactory, tenderResponseFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const toObject = data => {
  return JSON.parse(JSON.stringify(data));
};

describe('Tender response db', () => {
  let _tender;
  let _company;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory({ status: 'open' });
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
      suggestedManufacturerPartNumber: 10,
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

    const tenderResponseObj = await TenderResponses.createTenderResponse({
      tenderId: _tender._id,
      supplierId: _company._id,
      respondedProducts,
      respondedDocuments,
    });

    expect(tenderResponseObj).toBeDefined();
    expect(tenderResponseObj.tenderId.toString()).toBe(_tender._id.toString());
    expect(tenderResponseObj.supplierId.toString()).toBe(_company._id.toString());
    expect(tenderResponseObj.isNotInterested).toBe(false);

    expect(toObject(tenderResponseObj.respondedProducts)).toEqual(respondedProducts);
    expect(toObject(tenderResponseObj.respondedDocuments)).toEqual(respondedDocuments);

    // check duplications
    const response = await TenderResponses.createTenderResponse({
      tenderId: _tender._id,
      supplierId: _company._id,
      respondedProducts,
    });

    expect(await TenderResponses.find().count()).toBe(1);

    expect(response.isSent).toBe(false);
  });

  test('Create tender response: with not open status', async () => {
    expect.assertions(1);

    const tender = await tenderFactory({ status: 'draft' });

    try {
      await TenderResponses.createTenderResponse({ tenderId: tender._id });
    } catch (e) {
      expect(e.message).toBe('This tender is not available');
    }
  });

  test('Send', async () => {
    const tender = await tenderFactory({ status: 'canceled' });

    let tenderResponse = await tenderResponseFactory({ tenderId: tender._id });

    tenderResponse = await TenderResponses.findOne({ _id: tenderResponse._id });

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

    expect(tenderResponse.isSent).toBe(true);
  });

  test('Send: EOI with late status', async () => {
    const tender = await tenderFactory({ type: 'eoi', status: 'closed' });

    await tenderResponseFactory({ tenderId: tender._id });

    let tenderResponse = await TenderResponses.findOne({ tenderId: tender._id });

    await tenderResponse.send();

    tenderResponse = await TenderResponses.findOne({ _id: tenderResponse._id });

    expect(tenderResponse.status).toBe('late');
    expect(tenderResponse.isSent).toBe(true);
  });

  test('Edit tender response', async () => {
    const response = await tenderResponseFactory({});

    expect.assertions(3);

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
          suggestedManufacturerPartNumber: 10,
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

    expect(toObject(updatedResponse.respondedProducts)).toEqual(doc.respondedProducts);
    expect(toObject(updatedResponse.respondedDocuments)).toEqual(doc.respondedDocuments);
  });
});
