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
      manufacturerPartNumber: 10,
    },
  ];

  const checkProducts = (product, doc) => {
    expect(product.code).toBe(doc.code);
    expect(product.purchaseRequestNumber).toBe(doc.purchaseRequestNumber);
    expect(product.shortText).toBe(doc.shortText);
    expect(product.quantity).toBe(doc.quantity);
    expect(product.uom).toBe(doc.uom);
    expect(product.manufacturer).toBe(doc.manufacturer);
    expect(product.manufacturerPartNumber).toBe(doc.manufacturerPartNumber);
  };

  test('Create tender', async () => {
    const tenderObj = await Tenders.create({
      type: _tender.type,
      number: _tender.number,
      name: _tender.name,
      publishDate: _tender.publishDate,
      closeDate: _tender.closeDate,
      file: _tender.file,
      reminderDay: _tender.reminderDay,
      supplierIds: _tender.supplierIds,
      requestedProducts,
      requestedDocuments: ['Document1'],
    });

    expect(tenderObj).toBeDefined();
    expect(tenderObj.type).toBe(_tender.type);
    expect(tenderObj.number).toBe(_tender.number);
    expect(tenderObj.name).toBe(_tender.name);
    expect(tenderObj.publishDate).toEqual(_tender.publishDate);
    expect(tenderObj.closeDate).toEqual(_tender.closeDate);
    expect(tenderObj.file.toJSON()).toEqual(_tender.file.toJSON());
    expect(tenderObj.supplierIds).toContain(..._tender.supplierIds);
    expect(tenderObj.reminderDay).toBe(_tender.reminderDay);
    expect(tenderObj.requestedDocuments).toContain(..._tender.requestedDocuments);

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
      requestedDocuments: ['Document1'],
    };

    const tenderObj = await Tenders.updateTender(_tender.id, doc);

    expect(tenderObj.number).toBe(doc.number);
    expect(tenderObj.name).toBe(doc.name);
    expect(tenderObj.publishDate).toEqual(doc.publishDate);
    expect(tenderObj.closeDate).toEqual(doc.closeDate);
    expect(tenderObj.supplierIds).toContain(...doc.supplierIds);
    expect(tenderObj.file.toJSON()).toEqual(doc.file);
    expect(tenderObj.reminderDay).toBe(doc.reminderDay);
    expect(tenderObj.requestedDocuments).toContain(...doc.requestedDocuments);

    checkProducts(tenderObj.requestedProducts[0], requestedProducts[0]);
  });

  test('Delete tender', async () => {
    await Tenders.removeTender(_tender.id);

    expect(await Tenders.find({ _id: _tender.id }).count()).toBe(0);
  });

  test('Award', async () => {
    expect(_tender.winnerId).toBe(undefined);

    const responseId = 'DFAFDSFDSF';

    const updatedTender = await Tenders.award(_tender.id, responseId);

    expect(updatedTender.winnerId).toBe(responseId);
  });
});
