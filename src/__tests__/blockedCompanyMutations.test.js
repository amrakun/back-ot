/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { BlockedCompanies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
import blockedCompanyMutations from '../data/resolvers/mutations/blockedCompanies';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company mutations', () => {
  test('Buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(2);

    const mutations = ['blockedCompaniesBlock', 'blockedCompaniesUnblock'];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(blockedCompanyMutations[mutation], {}, { user });
    }
  });

  test('block a company', async () => {
    const supplier = await companyFactory({});

    const blockMutation = `
      mutation blockedCompaniesBlock(
        $supplierIds: [String!]!
        $startDate: Date!
        $endDate: Date!
        $note: String
      ) {
        blockedCompaniesBlock(
          supplierIds: $supplierIds
          startDate: $startDate
          endDate: $endDate
          note: $note
        )
      }
    `;

    const doc = {
      supplierIds: [supplier._id],
      startDate: new Date(),
      endDate: new Date(),
      note: 'note',
    };

    const context = {
      user: await userFactory(),
    };

    await graphqlRequest(blockMutation, 'blockedCompaniesBlock', doc, context);

    expect(await BlockedCompanies.find().count()).toBe(1);

    const blockedCompany = await BlockedCompanies.findOne();

    expect(blockedCompany.createdUserId).toBe(context.user._id);

    // unblock  =====================
    const unblockMutation = `
      mutation blockedCompaniesUnblock($supplierIds: [String!]!) {
        blockedCompaniesUnblock(supplierIds: $supplierIds)
      }
    `;

    const unblockDoc = { supplierIds: [blockedCompany.supplierId] };

    await graphqlRequest(unblockMutation, 'blockedCompaniesUnblock', unblockDoc, context);

    expect(await BlockedCompanies.find().count()).toBe(0);
  });
});
