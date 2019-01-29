/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderMessages } from '../db/models';
import { userFactory, tenderFactory } from '../db/factories';

import queries from '../data/resolvers/queries/tenderMessages';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender message queries', () => {
  let _admin;
  let _supplier;
  let _supplier2;
  let _tender;

  beforeEach(async () => {
    // Creating test data
    _admin = await userFactory({ isSupplier: false });
    _supplier = await userFactory({ isSupplier: true });
    _supplier2 = await userFactory({ isSupplier: true });
    _tender = await tenderFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await TenderMessages.remove({});
    await Tenders.remove({});
    await Users.remove({});
  });

  const adminToSupplier = async () => {
    return TenderMessages.tenderMessageBuyerSend(
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
        recipientSupplierIds: [_supplier.companyId],
      },
      _admin,
    );
  };

  const supplierToAdmin = async () => {
    return TenderMessages.tenderMessageSupplierSend(
      {
        tenderId: _tender._id,
        subject: 'test',
        body: 'test',
      },
      _supplier,
    );
  };

  test('Supplier cannot view unrelated message list', async () => {
    await adminToSupplier();
    await adminToSupplier();
    await supplierToAdmin();

    const result = await queries.tenderMessages(
      {},
      { tenderId: _tender._id },
      { user: _supplier2 },
    );

    expect(result).toHaveLength(0);
  });

  test('Supplier cannot view unrelated message', async () => {
    await adminToSupplier();
    const msg = await adminToSupplier();
    const msg2 = await supplierToAdmin();

    const result = await queries.tenderMessageDetail({}, { _id: msg._id }, { user: _supplier2 });

    const result2 = await queries.tenderMessageDetail({}, { _id: msg2._id }, { user: _supplier2 });

    expect(result).toBeNull();
    expect(result2).toBeNull();
  });

  test("Supplier cannot view unrelated tender's message count", async () => {
    await adminToSupplier();
    await adminToSupplier();
    await supplierToAdmin();

    expect.assertions(1);
    try {
      await queries.tenderMessageTotalCount({}, { tenderId: _tender._id }, { user: _supplier2 });
    } catch (e) {
      expect(e.message).toBe('Permission denied');
    }
  });
});
