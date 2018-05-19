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

  test('Save prequalification duration of warranty', async () => {
    const doc = configDocs.prequalification;

    const config = await Configs.savePrequalificationDow(doc);

    expect(config.prequalificationDow.toJSON()).toEqual(doc.common);
    expect(config.specificPrequalificationDow.toJSON()).toEqual(doc.specific);
  });

  test('Save audit duration of warranty', async () => {
    const doc = configDocs.audit;

    const config = await Configs.saveAuditDow(doc);

    expect(config.auditDow.toJSON()).toEqual(doc.common);
    expect(config.specificAuditDow.toJSON()).toEqual(doc.specific);
  });

  test('Save improvementPlan duration of warranty', async () => {
    const doc = configDocs.improvementPlan;

    const config = await Configs.saveImprovementPlanDow(doc);

    expect(config.improvementPlanDow.toJSON()).toEqual(doc.common);
    expect(config.specificImprovementPlanDow.toJSON()).toEqual(doc.specific);
  });
});
