/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderResponses, Companies } from '../db/models';
import { tenderFactory, tenderResponseFactory, userFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('Tender queries', () => {
  const commonParams = `
    $tenderId: String!
    $supplierIds: [String!]!
  `;

  const commonValues = `
    tenderId: $tenderId
    supplierIds: $supplierIds
  `;

  const query = `
    query tenderResponsesEoiShortList(${commonParams}) {
      tenderResponsesEoiShortList(${commonValues})
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Tenders.remove({});
    await TenderResponses.remove({});
    await Companies.remove({});
  });

  test('short list', async () => {
    const user = await userFactory({ isSupplier: true });
    const user2 = await userFactory({ isSupplier: true });

    const tender = await tenderFactory({
      status: 'open',
      supplierIds: [user.companyId, user2.companyId],
    });

    const response = await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: user.companyId,
      isSent: true,
    });

    const response2 = await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: user2.companyId,
      isSent: true,
    });

    // not sent regret letter ================
    await graphqlRequest(query, 'tenderResponsesEoiShortList', {
      tenderId: tender._id,
      supplierIds: [response.supplierId],
    });

    let updatedTender = await Tenders.findOne({ _id: tender._id });

    expect(updatedTender.getbidderListedSupplierIds()).toEqual([response.supplierId]);

    // sent regret letter ================
    await Tenders.update({ _id: tender._id }, { $set: { sentRegretLetter: true } });

    await graphqlRequest(query, 'tenderResponsesEoiShortList', {
      tenderId: tender._id,
      supplierIds: [response.supplierId, response2.supplierId],
    });

    updatedTender = await Tenders.findOne({ _id: tender._id });

    expect(updatedTender.getbidderListedSupplierIds()).not.toEqual([
      response.supplierId,
      response2.supplierId,
    ]);
  });
});
