/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, PhysicalAudits } from '../db/models';
import { userFactory, physicalAuditFactory } from '../db/factories';
import queries from '../data/resolvers/queries/physicalAudits';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  afterEach(async () => {
    // Clearing test data
    await PhysicalAudits.remove({});
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

    for (let query of ['physicalAudits', 'physicalAuditDetail']) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('physicalAudits', async () => {
    const query = `
      query physicalAudits {
        physicalAudits {
          _id
          createdDate
          createdUserId
          isQualified
          supplierId
          reportFile
          improvementPlanFile
        }
      }
    `;

    await physicalAuditFactory({});

    let response = await graphqlRequest(query, 'physicalAudits', {});

    expect(response.length).toBe(1);
  });

  test('physicalAudit detail', async () => {
    const query = `
      query physicalAuditDetail($_id: String!) {
        physicalAuditDetail(_id: $_id) {
          _id
          createdDate
          createdUserId
          isQualified
          supplierId
          reportFile
          improvementPlanFile

          createdUser {
            _id
          }

          supplier {
            _id
          }
        }
      }
    `;

    const physicalAudit = await physicalAuditFactory({});
    const args = { _id: physicalAudit._id };

    let response = await graphqlRequest(query, 'physicalAuditDetail', args);

    expect(response.createdUser._id).toBeDefined();
    expect(response.supplier._id).toBeDefined();
  });
});
