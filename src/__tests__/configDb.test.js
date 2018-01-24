/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Configs } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Config db', () => {
  test('Save basic info', async () => {
    const doc = {
      logo: '/path',
      name: 'name',
      phone: 53535353,
      email: 'email@gmail.com',
      address: 'address',
    };

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
    const doc = {
      common: {
        duration: 'year',
        amount: 2,
      },

      specifics: [
        {
          supplierId: '_id1',
          duration: 'month',
          amount: 2,
        },
        {
          supplierId: '_id2',
          duration: 'day',
          amount: 2,
        },
      ],
    };

    const config = await Configs.savePrequalificationDow(doc);

    expect(config.prequalificationDow.toJSON()).toEqual(doc.common);

    const [specific1, specific2] = config.specificPrequalificationDows;

    expect(specific1.toJSON()).toEqual(doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(doc.specifics[1]);
  });

  test('Save audit duration of warranty', async () => {
    const doc = {
      common: {
        duration: 'year',
        amount: 2,
      },

      specifics: [
        {
          supplierId: '_id1',
          duration: 'month',
          amount: 2,
        },
        {
          supplierId: '_id2',
          duration: 'day',
          amount: 2,
        },
      ],
    };

    const config = await Configs.saveAuditDow(doc);

    expect(config.auditDow.toJSON()).toEqual(doc.common);

    const [specific1, specific2] = config.specificAuditDows;

    expect(specific1.toJSON()).toEqual(doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(doc.specifics[1]);
  });

  test('Save improvementPlan duration of warranty', async () => {
    const doc = {
      common: {
        tierType: 'national',
        duration: 'year',
        amount: 2,
      },

      specifics: [
        {
          supplierId: '_id1',
          tierType: 'national',
          duration: 'month',
          amount: 2,
        },
        {
          supplierId: '_id2',
          tierType: 'national',
          duration: 'day',
          amount: 2,
        },
      ],
    };

    const config = await Configs.saveImprovementPlanDow(doc);

    expect(config.improvementPlanDow.toJSON()).toEqual(doc.common);

    const [specific1, specific2] = config.specificImprovementPlanDows;

    expect(specific1.toJSON()).toEqual(doc.specifics[0]);
    expect(specific2.toJSON()).toEqual(doc.specifics[1]);
  });
});
