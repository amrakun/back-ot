/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderResponses, Companies } from '../db/models';
import { userFactory, tenderFactory, tenderResponseFactory, companyFactory } from '../db/factories';

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

  test('tenders', async () => {
    // Creating test data ==============

    supplier1 = await companyFactory();
    supplier2 = await companyFactory();

    user = await userFactory({ companyId: supplier1._id });

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

    // name ===============
    response = await graphqlRequest(query, 'tenders', { search: 'test' }, { user });
    expect(response.length).toBe(1);

    // number ===============
    response = await graphqlRequest(query, 'tenders', { search: '1' }, { user });
    expect(response.length).toBe(2);
  });
});
