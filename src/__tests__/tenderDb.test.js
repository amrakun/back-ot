/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tenders } from '../db/models';
import { tenderFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender db', () => {
  let _tender;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
  });

  const requestedProducts = [
    {
      code: 'code',
      purchaseRequestNumber: 90,
      shortText: 'shorttext',
      quantity: 10,
      uom: 'uom',
      manufacturer: 'manufacturer',
      manufacturerPart: 'manufacturerPart',
      suggestedManufacturer: 'suggestedManufacturer',
      suggestedManufacturerPart: 'suggestedManufacturerPart',
      unitPrice: 10000,
      totalPrice: 10000,
      leadTime: 10,
      comment: 'comment',
      picture: { name: 'file', url: 'url' },
    },
  ];

  const checkProducts = (product, doc) => {
    expect(product.code).toBe(doc.code);
    expect(product.purchaseRequestNumber).toBe(doc.purchaseRequestNumber);
    expect(product.shortText).toBe(doc.shortText);
    expect(product.quantity).toBe(doc.quantity);
    expect(product.uom).toBe(doc.uom);
    expect(product.manufacturer).toBe(doc.manufacturer);
    expect(product.manufacturerPart).toBe(doc.manufacturerPart);
    expect(product.suggestedManufacturer).toBe(doc.suggestedManufacturer);
    expect(product.suggestedManufacturerPart).toBe(doc.suggestedManufacturerPart);
    expect(product.unitPrice).toBe(doc.unitPrice);
    expect(product.totalPrice).toBe(doc.totalPrice);
    expect(product.leadTime).toBe(doc.leadTime);
    expect(product.comment).toBe(doc.comment);
    expect(product.picture.name).toBe(doc.picture.name);
    expect(product.picture.url).toBe(doc.picture.url);
  };

  test('Create tender', async () => {
    const tenderObj = await Tenders.create({
      number: _tender.number,
      name: _tender.name,
      publishDate: _tender.publishDate,
      closeDate: _tender.closeDate,
      file: _tender.file,
      reminderDay: _tender.reminderDay,
      supplierIds: _tender.supplierIds,
      requestedProducts,
    });

    expect(tenderObj).toBeDefined();
    expect(tenderObj.number).toBe(_tender.number);
    expect(tenderObj.name).toBe(_tender.name);
    expect(tenderObj.publishDate).toEqual(_tender.publishDate);
    expect(tenderObj.closeDate).toEqual(_tender.closeDate);
    expect(tenderObj.file.toJSON()).toEqual(_tender.file.toJSON());
    expect(tenderObj.supplierIds).toContain(..._tender.supplierIds);
    expect(tenderObj.reminderDay).toBe(_tender.reminderDay);

    checkProducts(tenderObj.requestedProducts[0], requestedProducts[0]);
  });

  test('Update tender', async () => {
    const doc = {
      number: 90,
      name: 'name',
      publishDate: new Date(),
      closeDate: new Date(),
      supplierIds: ['1', '2'],
      file: { name: 'file', url: 'url ' },
      reminderDay: 1,
      requestedProducts,
    };

    const tenderObj = await Tenders.updateTender(_tender.id, doc);

    expect(tenderObj.number).toBe(doc.number);
    expect(tenderObj.name).toBe(doc.name);
    expect(tenderObj.publishDate).toEqual(doc.publishDate);
    expect(tenderObj.closeDate).toEqual(doc.closeDate);
    expect(tenderObj.supplierIds).toContain(...doc.supplierIds);
    expect(tenderObj.file.toJSON()).toEqual(doc.file);
    expect(tenderObj.reminderDay).toBe(doc.reminderDay);

    checkProducts(tenderObj.requestedProducts[0], requestedProducts[0]);
  });

  test('Delete tender', async () => {
    await Tenders.removeTender(_tender.id);

    expect(await Tenders.find({ _id: _tender.id }).count()).toBe(0);
  });
});
