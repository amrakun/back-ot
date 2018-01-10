/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { BlockedCompanies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
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
