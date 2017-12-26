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

  test('Create tender', async () => {
    delete _tender._id;

    let tenderObj = await Tenders.createTender(_tender);

    tenderObj = JSON.parse(JSON.stringify(tenderObj));
    delete tenderObj._id;
    delete tenderObj.__v;

    expect(tenderObj).toEqual(_tender);
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

    const responseId = 'DFAFDSFDSF';

    const updatedTender = await Tenders.award(_tender._id, responseId);

    expect(updatedTender.winnerId).toBe(responseId);
  });
});
