/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderMessages } from '../db/models';
import { userFactory, tenderFactory } from '../db/factories';

import mutations from '../data/resolvers/mutations/tenderMessages';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
  let _admin;
  let _supplier;
  let _tender;

  beforeEach(async () => {
    // Creating test data
    _admin = await userFactory({ isSupplier: false });
    _supplier = await userFactory({ isSupplier: true });
    _tender = await tenderFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await TenderMessages.remove({});
    await Tenders.remove({});
    await Users.remove({});
  });

  test('Supplier cannot send as buyer', async () => {
    expect.assertions(1);

    try {
      await mutations.tenderMessageBuyerSend(
        {},
        { tenderId: _tender._id, subject: 'test', body: 'test' },
        { user: _supplier },
      );
    } catch (e) {
      expect(e.message).toEqual('Permission denied');
    }
  });
  test('Buyer cannot send as supplier', async () => {
    expect.assertions(1);
    try {
      await mutations.tenderMessageSupplierSend(
        {},
        { tenderId: _tender._id, subject: 'test', body: 'test' },
        { user: _admin },
      );
    } catch (e) {
      expect(e.message).toEqual('Permission denied');
    }
  });

  test('Login required', async () => {
    expect.assertions(1);
    try {
      await mutations.tenderMessageSupplierSend(
        {},
        { tenderId: _tender._id, subject: 'test', body: 'test' },
        { user: undefined },
      );
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Supplier can send', async () => {
    const result = await mutations.tenderMessageSupplierSend(
      {},
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
        attachment: { name: 'name', url: 'url' },
      },
      { user: _supplier },
    );
    expect(result._id).toBeDefined();
    expect(result.senderSupplierId).toBe(_supplier.companyId);
    expect(result.recipientSupplierIds).toHaveLength(0);
    expect(result.subject).toBeTruthy();
    expect(result.body).toBeTruthy();
  });

  test('Buyer can send', async () => {
    const result = await mutations.tenderMessageBuyerSend(
      {},
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
        recipientSupplierIds: [_supplier._id],
        attachment: { name: 'name', url: 'url' },
      },
      { user: _admin },
    );
    expect(result._id).toBeDefined();
    expect(result.senderBuyerId).toBe(_admin._id);
    expect(result.recipientSupplierIds).toHaveLength(1);
    expect(result.subject).toBeTruthy();
    expect(result.body).toBeTruthy();
    expect(result.senderBuyerId).toBe(_admin._id);
  });

  test('Supplier can set as read', async () => {
    const adminToSupplier = await mutations.tenderMessageBuyerSend(
      {},
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
        recipientSupplierIds: [_supplier.companyId],
      },
      { user: _admin },
    );

    await mutations.tenderMessageSetAsRead({}, { _id: adminToSupplier._id }, { user: _supplier });
    const updated = await TenderMessages.findOne({ _id: adminToSupplier._id });
    expect(updated.isRead).toBeTruthy();
  });

  test('Buyer can set as read', async () => {
    const supplierToAdmin = await mutations.tenderMessageSupplierSend(
      {},
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
        senderSupplierId: _supplier.companyId,
      },
      { user: _supplier },
    );

    await mutations.tenderMessageSetAsRead({}, { _id: supplierToAdmin._id }, { user: _admin });
    const updated = await TenderMessages.findOne({ _id: supplierToAdmin._id });
    expect(updated.isRead).toBeTruthy();
  });

  test('Supplier cannot set as read on behalf of buyer', async () => {
    const supplierToAdmin = await mutations.tenderMessageSupplierSend(
      {},
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
        senderSupplierId: _supplier.companyId,
      },
      { user: _supplier },
    );

    await mutations.tenderMessageSetAsRead({}, { _id: supplierToAdmin._id }, { user: _supplier });

    const updated = await TenderMessages.findOne({ _id: supplierToAdmin._id });
    expect(updated.isRead).toBeFalsy();
  });
});
