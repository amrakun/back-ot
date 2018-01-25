/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Configs } from '../db/models';
import { configFactory } from '../db/factories';

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

          eoiTemplate
          rfqTemplate
          regretLetterTemplate
          successFeedbackTemplate
          auditTemplate

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
});
