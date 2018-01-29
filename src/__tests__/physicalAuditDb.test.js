/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies, PhysicalAudits } from '../db/models';
import { userFactory, companyFactory, physicalAuditFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('PhysicalAudit db', () => {
  let user;

  beforeEach(async () => {
    // Creating test data
    user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await PhysicalAudits.remove({});
    await Companies.remove({});
  });

  test('Create physicalAudit', async () => {
    const company = await companyFactory();

    const doc = {
      isQualified: true,
      supplierId: company._id,
      reportFile: '/reportFile',
      improvementPlanFile: '/improvementPlanFile',
    };

    const physicalAuditObj = await PhysicalAudits.createPhysicalAudit(doc, user._id);

    expect(physicalAuditObj.createdUserId).toEqual(user._id);
    expect(physicalAuditObj.isQualified).toEqual(doc.isQualified);
    expect(physicalAuditObj.supplierId).toEqual(doc.supplierId);
    expect(physicalAuditObj.reportFile).toEqual(doc.reportFile);
    expect(physicalAuditObj.improvementPlanFile).toEqual(doc.improvementPlanFile);

    const updatedCompany = await Companies.findOne({ _id: company._id });
    expect(updatedCompany.isQualified).toBe(true);
  });

  test('Update physicalAudit', async () => {
    const doc = await physicalAuditFactory({});
    const _id = doc._id;

    const physicalAuditObj = await PhysicalAudits.updatePhysicalAudit(
      _id,
      { isQualified: false, reportFile: '/path' },
      user._id,
    );

    expect(physicalAuditObj.isQualified).toEqual(false);
    expect(physicalAuditObj.reportFile).toEqual('/path');

    const updatedCompany = await Companies.findOne({ _id: doc.supplierId });
    expect(updatedCompany.isQualified).toBe(false);
  });

  test('Remove physicalAudit', async () => {
    const physicalAudit = await physicalAuditFactory({});

    await PhysicalAudits.removePhysicalAudit(physicalAudit._id);

    expect(await PhysicalAudits.find().count()).toBe(0);
  });
});
