/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Users, Audits } from '../db/models';
import { userFactory, companyFactory, auditFactory } from '../db/factories';
import queries from '../data/resolvers/queries/audits';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Audits.remove({});
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

    expect.assertions(2);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['audits', 'auditDetail']) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('audits', async () => {
    const query = `
      query audits {
        audits {
          _id
          createdUserId
          date
          supplierIds
        }
      }
    `;

    await auditFactory({});
    await auditFactory({});

    const response = await graphqlRequest(query, 'audits', {});

    expect(response.length).toBe(2);
  });

  test('audit detail', async () => {
    const user = await userFactory({ isSupplier: false });

    const audit = await auditFactory({
      createdUserId: user._id,
      supplierIds: [_company._id],
    });

    const query = `
      query auditDetail($_id: String!) {
        auditDetail(_id: $_id) {
          _id
          createdUserId
          date
          supplierIds

          createdUser {
            _id
          }

          suppliers {
            _id
          }
        }
      }
    `;

    const args = { _id: audit._id };
    const context = { user };
    const response = await graphqlRequest(query, 'auditDetail', args, context);

    expect(response.createdUser._id).toBe(user._id);
    expect(response.suppliers.length).toBe(1);

    expect(response.date).toBeDefined();
  });
});
