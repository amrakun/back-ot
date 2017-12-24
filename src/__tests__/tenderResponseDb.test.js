/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tenders, TenderResponses, Companies } from '../db/models';
import { tenderFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender response db', () => {
  let _tender;
  let _company;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory();
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

  const checkProducts = (product, doc) => {
    expect(product.code).toBe(doc.code);
    expect(product.suggestedManufacturer).toBe(doc.suggestedManufacturer);
    expect(product.suggestedManufacturerPartNumber).toBe(doc.suggestedManufacturerPartNumber);
    expect(product.unitPrice).toBe(doc.unitPrice);
    expect(product.totalPrice).toBe(doc.totalPrice);
    expect(product.leadTime).toBe(doc.leadTime);
    expect(product.comment).toBe(doc.comment);
    expect(product.file.name).toBe(doc.file.name);
    expect(product.file.url).toBe(doc.file.url);
  };

  test('Create tender response', async () => {
    const tenderResponseObj = await TenderResponses.create({
      tenderId: _tender._id,
      supplierId: _company._id,
      respondedProducts,
    });

    expect(tenderResponseObj).toBeDefined();
    expect(tenderResponseObj.tenderId.toString()).toBe(_tender._id.toString());
    expect(tenderResponseObj.supplierId.toString()).toBe(_company._id.toString());

    checkProducts(tenderResponseObj.respondedProducts[0], respondedProducts[0]);
  });
});
