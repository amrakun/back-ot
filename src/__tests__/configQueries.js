/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Configs } from '../db/models';
import { userFactory, configFactory } from '../db/factories';
import queries from '../data/resolvers/queries/configs';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Config queries', () => {
  afterEach(async () => {
    await Configs.remove({});
  });

  test('config', async () => {
    await configFactory({ name: 'name' });

    const query = `
      query config {
        config {
          _id

          logo
          name
          phone
          email
          address

          rfqTemplates
          eoiTemplates
          successFeedbackTemplates
          capacityBuildingTemplates
          blockTemplates
          prequalificationTemplates
          desktopAuditTemplates

          prequalificationDow
          specificPrequalificationDow

          auditDow
          specificAuditDow

          improvementPlanDow
          specificImprovementPlanDow
        }
      }
    `;

    let response = await graphqlRequest(query, 'config', {});

    expect(response.name).toBe('name');
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

    for (let query of ['config']) {
      checkLogin(queries[query], {}, { user });
    }
  });
});
