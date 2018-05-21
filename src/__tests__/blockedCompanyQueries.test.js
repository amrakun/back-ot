/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Users, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
import queries from '../data/resolvers/queries/blockedCompanies';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await BlockedCompanies.remove({});
    await Users.remove({});
  });

  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(1);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['blockedCompanies']) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('blockedCompanies', async () => {
    const query = `
      query blockedCompanies {
        blockedCompanies {
          _id
          supplierId
          startDate
          endDate
          note

          createdUserId

          createdUser {
            username
          }

          supplier {
            basicInfo {
              enName
            }
          }
        }
      }
    `;

    const supplier = await companyFactory({ enName: 'testName' });
    const user = await userFactory({ username: 'username' });

    await BlockedCompanies.block(
      {
        supplierId: supplier._id,
        groupId: 'DFADFFDFDA',
        startDate: new Date(),
        endDate: new Date(),
        note: 'note',
      },
      user._id,
    );

    let response = await graphqlRequest(query, 'blockedCompanies', {});

    expect(response.length).toBe(1);

    const [blockedCompany] = response;

    expect(blockedCompany.createdUser.username).toBe('username');
    expect(blockedCompany.supplier.basicInfo.enName).toBe('testName');
  });
});
