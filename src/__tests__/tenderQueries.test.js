/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderResponses, Companies } from '../db/models';
import { userFactory, tenderFactory, tenderResponseFactory, companyFactory } from '../db/factories';
import tenderQueries from '../data/resolvers/queries/tenders';
import tenderResponseExports from '../data/resolvers/queries/tenderResponseExports';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender queries', () => {
  let user;
  let supplier1;
  let supplier2;

  const commonParams = `
    $type: String,
    $status: String,
    $search: String,
    $supplierId: String,
    $ignoreSubmitted: Boolean
  `;

  const commonValues = `
    type: $type,
    status: $status,
    search: $search,
    supplierId: $supplierId,
    ignoreSubmitted: $ignoreSubmitted
  `;

  const query = `
    query tenders(${commonParams}) {
      tenders(${commonValues}) {
        _id
        type
        status
        supplierIds
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Tenders.remove({});
    await TenderResponses.remove({});
    await Companies.remove({});
  });

  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(4);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['tendersExport']) {
      checkLogin(tenderQueries[query], {}, { user });
    }

    const qs = [
      'tenderResponsesRfqBidSummaryReport',
      'tenderResponsesEoiShortList',
      'tenderResponsesEoiBidderList',
    ];

    for (let query of qs) {
      checkLogin(tenderResponseExports[query], {}, { user });
    }
  });

  test('tenders', async () => {
    // Creating test data ==============

    supplier1 = await companyFactory();
    supplier2 = await companyFactory();

    user = await userFactory({ companyId: supplier1._id, isSupplier: false });

    const tender = await tenderFactory({ type: 'rfq' });

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier1._id,
      isNotInterested: true,
    });

    await tenderFactory({
      type: 'rfq',
      status: 'open',
      name: 'test',
      publishDate: new Date('2012-01-01'),
      closeDate: new Date('2012-02-01'),
    });

    await tenderFactory({ type: 'rfq', supplierIds: [supplier1._id], number: 1 });
    await tenderFactory({ type: 'eoi', supplierIds: [supplier2._id], number: 1 });

    // When there is no filter, it must return all tenders =============
    let response = await graphqlRequest(query, 'tenders', {});

    expect(response.length).toBe(4);

    // filter by type ===============
    response = await graphqlRequest(query, 'tenders', { type: 'rfq' });

    expect(response.length).toBe(3);
    expect(response[0].type).toBe('rfq');

    response = await graphqlRequest(query, 'tenders', { type: 'eoi' });

    expect(response.length).toBe(1);
    expect(response[0].type).toBe('eoi');

    // filter by supplier ===============
    response = await graphqlRequest(query, 'tenders', { supplierId: supplier1._id });

    expect(response.length).toBe(1);
    expect(response[0].supplierIds).toContain(supplier1._id);

    // ignore submitted ===============
    response = await graphqlRequest(query, 'tenders', { ignoreSubmitted: true }, { user });

    expect(response.length).toBe(3);

    // status ===============
    response = await graphqlRequest(query, 'tenders', { status: 'open' }, { user });
    expect(response.length).toBe(1);

    response = await graphqlRequest(query, 'tenders', { status: 'draft' }, { user });
    expect(response.length).toBe(3);

    response = await graphqlRequest(query, 'tenders', { status: 'draft,open' }, { user });
    expect(response.length).toBe(4);

    // name ===============
    response = await graphqlRequest(query, 'tenders', { search: 'test' }, { user });
    expect(response.length).toBe(1);

    // number ===============
    response = await graphqlRequest(query, 'tenders', { search: '1' }, { user });
    expect(response.length).toBe(2);
  });

  test('tenders: always hide draft tenders from supplier', async () => {
    user = await userFactory({ isSupplier: true });

    await tenderFactory({ status: 'open' });
    await tenderFactory({ status: 'draft' });

    let response = await graphqlRequest(query, 'tenders', {}, { user });

    expect(response.length).toBe(1);
  });

  test('tenders: participated status', async () => {
    user = await userFactory({ isSupplier: true });

    const tender = await tenderFactory({ status: 'open' });

    await tenderFactory({ status: 'closed' });
    await tenderFactory({ status: 'open' });

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: user.companyId,
    });

    let response = await graphqlRequest(
      query,
      'tenders',
      { status: 'open,participated' },
      { user },
    );

    expect(response.length).toBe(2);
  });
});
