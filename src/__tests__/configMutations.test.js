/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Configs, Companies } from '../db/models';

import { userFactory, configDocs } from '../db/factories';

import configMutations from '../data/resolvers/mutations/configs';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Config mutations', () => {
  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Companies.remove({});
    await Configs.remove({});
  });

  test('Buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(5);

    const mutations = [
      'configsSaveBasicInfo',
      'configsSaveTemplate',
      'configsSavePrequalificationDow',
      'configsSaveAuditDow',
      'configsSaveImprovementPlanDow',
    ];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(configMutations[mutation], {}, { user });
    }
  });

  test('Save basic info', async () => {
    const mutation = `
      mutation configsSaveBasicInfo(
        $logo: String!,
        $name: String!,
        $phone: String!,
        $email: String!,
        $address: String!,
      ) {
        configsSaveBasicInfo(
          logo: $logo,
          name: $name,
          phone: $phone,
          email: $email,
          address: $address,
        ) {

          _id
          logo,
          name,
          phone,
          email,
          address,
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });
    const args = configDocs.basicInfo;

    await graphqlRequest(mutation, 'configsSaveBasicInfo', args, { user });

    const config = await Configs.getConfig();

    expect(config.logo).toBe(args.logo);
    expect(config.name).toBe(args.name);
    expect(config.phone).toBe(args.phone);
    expect(config.email).toBe(args.email);
    expect(config.address).toBe(args.address);
  });

  test('Save template', async () => {
    const testTemplate = async (name, content) => {
      const mutation = `
        mutation configsSaveTemplate($name: String!, $content: String!) {
          configsSaveTemplate(name: $name, content: $content) {
            _id
            ${name}
          }
        }
      `;

      const user = await userFactory({ isSupplier: false });
      const args = { name, content };

      await graphqlRequest(mutation, 'configsSaveTemplate', args, { user });

      const config = await Configs.getConfig();

      expect(config[name]).toBe(content);
    };

    await testTemplate('eoiTemplate', 'content');
    await testTemplate('rfqTemplate', 'content');
    await testTemplate('regretLetterTemplate', 'content');
    await testTemplate('successFeedbackTemplate', 'content');
    await testTemplate('auditTemplate', 'content');
  });

  test('Save prequalification duration of warranty', async () => {
    const mutation = `
      mutation configsSavePrequalificationDow($doc: ConfigPrequalificationDowInput!) {
        configsSavePrequalificationDow(doc: $doc) {
          _id
          prequalificationDow,
          specificPrequalificationDows,
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });

    const args = { doc: configDocs.prequalification };

    await graphqlRequest(mutation, 'configsSavePrequalificationDow', args, { user });

    const config = await Configs.getConfig();

    expect(config.prequalificationDow.toJSON()).toEqual(args.doc.common);

    const [specific1, specific2] = config.specificPrequalificationDows;

    expect(specific1.toJSON()).toEqual(args.doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(args.doc.specifics[1]);
  });

  test('Save audit duration of warranty', async () => {
    const mutation = `
      mutation configsSaveAuditDow($doc: ConfigAuditDowInput!) {
        configsSaveAuditDow(doc: $doc) {
          _id
          auditDow,
          specificAuditDows,
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });

    const args = { doc: configDocs.audit };

    await graphqlRequest(mutation, 'configsSaveAuditDow', args, { user });

    const config = await Configs.getConfig();

    expect(config.auditDow.toJSON()).toEqual(args.doc.common);

    const [specific1, specific2] = config.specificAuditDows;

    expect(specific1.toJSON()).toEqual(args.doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(args.doc.specifics[1]);
  });

  test('Save improvementPlan duration of warranty', async () => {
    const mutation = `
      mutation configsSaveImprovementPlanDow($doc: ConfigImprovementPlanDowInput!) {
        configsSaveImprovementPlanDow(doc: $doc) {
          _id
          improvementPlanDow,
          specificImprovementPlanDows,
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });

    const args = { doc: configDocs.improvementPlan };

    await graphqlRequest(mutation, 'configsSaveImprovementPlanDow', args, { user });

    const config = await Configs.getConfig();

    expect(config.improvementPlanDow.toJSON()).toEqual(args.doc.common);

    const [specific1, specific2] = config.specificImprovementPlanDows;

    expect(specific1.toJSON()).toEqual(args.doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(args.doc.specifics[1]);
  });
});
