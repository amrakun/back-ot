/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Companies, PhysicalAudits } from '../db/models';
import { userFactory, companyFactory, physicalAuditFactory } from '../db/factories';
import physicalAuditMutations from '../data/resolvers/mutations/physicalAudits';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('PhysicalAudit mutations', () => {
  let user;
  let supplier;

  beforeEach(async () => {
    user = await userFactory({ isSupplier: false });
    supplier = await companyFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Companies.remove({});
    await PhysicalAudits.remove({});
  });

  test('Buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(3);

    const mutations = ['physicalAuditsAdd', 'physicalAuditsEdit', 'physicalAuditsRemove'];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(physicalAuditMutations[mutation], {}, { user });
    }
  });

  const commonParams = `
    $isQualified: Boolean!,
    $supplierId: String!,
    $reportFile: String!
    $improvementPlanFile: String!
  `;

  const commonValues = `
    isQualified: $isQualified,
    supplierId: $supplierId,
    reportFile: $reportFile,
    improvementPlanFile: $improvementPlanFile
  `;

  const commonFields = `
    _id
    isQualified
    supplierId
    reportFile
    improvementPlanFile
  `;

  test('Create physicalAudit', async () => {
    const args = {
      isQualified: true,
      supplierId: supplier._id,
      reportFile: '/reportFile',
      improvementPlanFile: '/improvementPlanFile',
    };

    const mutation = `
      mutation physicalAuditsAdd(${commonParams}) {
        physicalAuditsAdd(${commonValues}) {
          ${commonFields}
        }
      }
    `;

    await graphqlRequest(mutation, 'physicalAuditsAdd', args, { user });

    expect(await PhysicalAudits.find().count()).toBe(1);

    const physicalAudit = await PhysicalAudits.findOne({});

    expect(physicalAudit.createdUserId).toBe(user._id);
    expect(physicalAudit.isQualified).toEqual(args.isQualified);
    expect(physicalAudit.supplierId).toEqual(args.supplierId);
    expect(physicalAudit.reportFile).toEqual(args.reportFile);
    expect(physicalAudit.improvementPlanFile).toEqual(args.improvementPlanFile);
  });

  test('Update physicalAudit', async () => {
    const physicalAudit = await physicalAuditFactory();

    const args = {
      _id: physicalAudit._id,
      isQualified: false,
      supplierId: supplier._id,
      reportFile: '/updatedReportFile',
      improvementPlanFile: '/updatedImprovementPlanFile',
    };

    const mutation = `
      mutation physicalAuditsEdit($_id: String!, ${commonParams}) {
        physicalAuditsEdit(_id: $_id, ${commonValues}) {
          ${commonFields}
        }
      }
    `;

    await graphqlRequest(mutation, 'physicalAuditsEdit', args, { user });

    const updatedPhysicalAudit = await PhysicalAudits.findOne({ _id: physicalAudit._id });

    expect(updatedPhysicalAudit.reportFile).toEqual(args.reportFile);
    expect(updatedPhysicalAudit.improvementPlanFile).toEqual(args.improvementPlanFile);
  });

  test('Remove physicalAudit', async () => {
    const physicalAudit = await physicalAuditFactory();

    const args = { _id: physicalAudit._id };

    const mutation = `
      mutation physicalAuditsRemove($_id: String!) {
        physicalAuditsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'physicalAuditsRemove', args, { user });

    expect(await PhysicalAudits.count()).toBe(0);
  });
});
