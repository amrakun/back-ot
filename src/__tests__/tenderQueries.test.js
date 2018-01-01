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
    $supplierId: String,
    $ignoreSubmitted: Boolean
  `;

  const commonValues = `
    type: $type,
    supplierId: $supplierId,
    ignoreSubmitted: $ignoreSubmitted
  `;

  const query = `
    query tenders(${commonParams}) {
      tenders(${commonValues}) {
        _id
        type
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

    await tenderFactory({ type: 'rfq' });
    await tenderFactory({ type: 'rfq', supplierIds: [supplier1._id] });
    await tenderFactory({ type: 'eoi', supplierIds: [supplier2._id] });

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
  });
});
