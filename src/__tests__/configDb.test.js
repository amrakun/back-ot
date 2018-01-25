/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Configs } from '../db/models';
import { configDocs } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Config db', () => {
  test('Save basic info', async () => {
    const doc = configDocs.basicInfo;

    const config = await Configs.saveBasicInfo(doc);

    expect(config.logo).toBe(doc.logo);
    expect(config.name).toBe(doc.name);
    expect(config.phone).toBe(doc.phone);
    expect(config.email).toBe(doc.email);
    expect(config.address).toBe(doc.address);
  });

  test('Save templates', async () => {
    const testTemplate = async (name, content) => {
      const config = await Configs.saveTemplate(name, content);

      expect(config[name]).toBe(content);
    };

    const templateNames = [
      'eoiTemplate',
      'rfqTemplate',
      'regretLetterTemplate',
      'successFeedbackTemplate',
      'auditTemplate',
    ];

    for (let templateName of templateNames) {
      await testTemplate(templateName, 'content');
    }
  });

  test('Save prequalification duration of warranty', async () => {
    const doc = configDocs.prequalification;

    const config = await Configs.savePrequalificationDow(doc);

    expect(config.prequalificationDow.toJSON()).toEqual(doc.common);

    const [specific1, specific2] = config.specificPrequalificationDows;

    expect(specific1.toJSON()).toEqual(doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(doc.specifics[1]);
  });

  test('Save audit duration of warranty', async () => {
    const doc = configDocs.audit;

    const config = await Configs.saveAuditDow(doc);

    expect(config.auditDow.toJSON()).toEqual(doc.common);

    const [specific1, specific2] = config.specificAuditDows;

    expect(specific1.toJSON()).toEqual(doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(doc.specifics[1]);
  });

  test('Save improvementPlan duration of warranty', async () => {
    const doc = configDocs.improvementPlan;

    const config = await Configs.saveImprovementPlanDow(doc);

    expect(config.improvementPlanDow.toJSON()).toEqual(doc.common);

    const [specific1, specific2] = config.specificImprovementPlanDows;

    expect(specific1.toJSON()).toEqual(doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(doc.specifics[1]);
  });
});
