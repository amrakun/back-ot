/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Audits, AuditResponses, Companies, Configs } from '../db/models';

import {
  userFactory,
  companyFactory,
  auditFactory,
  auditResponseFactory,
  auditResponseDocs,
  configFactory,
} from '../db/factories';

import companyMutations from '../data/resolvers/mutations/audits';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Audit mutations', () => {
  let _user;
  let _company;
  let _audit;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory();
    _user = await userFactory({ companyId: _company._id, isSupplier: true });
    _audit = await auditFactory();
    await configFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Companies.remove({});
    await Audits.remove({});
    await Configs.remove({});
  });

  test('Supplier required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(6);

    const mutations = [
      'auditsSupplierSaveBasicInfo',
      'auditsSupplierSaveEvidenceInfo',
      'auditsSupplierSaveCoreHseqInfo',
      'auditsSupplierSaveHrInfo',
      'auditsSupplierSaveBusinessInfo',
      'auditsSupplierSendResponse',
    ];

    const user = await userFactory();

    for (let mutation of mutations) {
      checkLogin(companyMutations[mutation], {}, { user });
    }
  });

  test('Buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(6);

    const mutations = [
      'auditsAdd',
      'auditsBuyerSaveCoreHseqInfo',
      'auditsBuyerSaveHrInfo',
      'auditsBuyerSaveBusinessInfo',
      'auditsBuyerSaveFiles',
      'auditsBuyerSendFiles',
    ];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(companyMutations[mutation], {}, { user });
    }
  });

  test('Create audit', async () => {
    await Audits.remove({});

    const args = {
      supplierIds: [_company._id],
      publishDate: new Date(),
      content: 'content',
      closeDate: new Date(),
    };

    const mutation = `
      mutation auditsAdd(
        $supplierIds: [String]!
        $publishDate: Date!
        $content: String!
        $closeDate: Date!
      ) {
        auditsAdd(
          supplierIds: $supplierIds
          publishDate: $publishDate
          content: $content
          closeDate: $closeDate
        ) {
          _id
          publishDate
          closeDate
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });

    await graphqlRequest(mutation, 'auditsAdd', args, { user });

    expect(await Audits.find().count()).toBe(1);

    const audit = await Audits.findOne({});

    expect(audit.createdUserId).toBe(user._id);
    expect(audit.publishDate).toEqual(args.publishDate);
    expect(audit.closeDate).toEqual(args.closeDate);
    expect(audit.supplierIds).toContain(_company._id);
  });

  test('Save basic info', async () => {
    const args = {
      supplierId: _company._id,
      auditId: _audit._id,
      basicInfo: {
        sotri: 'sotri',
        sotie: 'sotie',
        otExperience: 'otExperience',
      },
    };

    const mutation = `
      mutation auditsSupplierSaveBasicInfo(
        $auditId: String,
        $basicInfo: AuditSupplierBasicInfoInput
      ) {

        auditsSupplierSaveBasicInfo(
          auditId: $auditId,
          basicInfo: $basicInfo
        ) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'auditsSupplierSaveBasicInfo', args, {
      user: _user,
    });

    expect(response._id).toBeDefined();
  });

  test('Save evidence info', async () => {
    AuditResponses.saveEvidenceInfo = jest.fn(() => ({ _id: 'DFAFDA' }));

    const args = {
      supplierId: _company._id,
      auditId: _audit._id,
      evidenceInfo: auditResponseDocs.evidenceInfo(),
    };

    const mutation = `
      mutation auditsSupplierSaveEvidenceInfo(
        $auditId: String,
        $evidenceInfo: AuditSupplierEvidenceInfoInput
      ) {

        auditsSupplierSaveEvidenceInfo(
          auditId: $auditId,
          evidenceInfo: $evidenceInfo
        ) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'auditsSaveEvidenceInfo', args, { user: _user });

    expect(AuditResponses.saveEvidenceInfo.mock.calls.length).toBe(1);

    expect(AuditResponses.saveEvidenceInfo).toBeCalledWith({
      supplierId: args.supplierId,
      auditId: args.auditId,
      doc: args.evidenceInfo,
    });
  });

  const callReplyRecommendMutation = async (mutation, name, isSupplier) => {
    const user = await userFactory({ companyId: _company._id, isSupplier });

    const context = { user };

    let docGeneratorArgs = [true, false];

    if (!isSupplier) {
      docGeneratorArgs = [false, true];
    }

    const args = {
      auditId: _audit._id,
      [name]: auditResponseDocs[name](...docGeneratorArgs),
    };

    if (!isSupplier) {
      args.supplierId = _company._id;
    }

    await graphqlRequest(mutation, name, args, context);

    const auditResponse = await AuditResponses.findOne({
      auditId: args.auditId,
      supplierId: _company._id,
    });

    if (!isSupplier) {
      expect(auditResponse.isBuyerNotified).toBe(true);
    }

    for (const fieldName of Object.keys(args[name])) {
      for (const subFieldName of Object.keys(args[name][fieldName])) {
        const subValue = auditResponse[name][fieldName][subFieldName];
        expect(subValue).toBe(args[name][fieldName][subFieldName]);
      }
    }
  };

  test('audits save core hseq info', async () => {
    // supplier =======
    await callReplyRecommendMutation(
      `mutation auditsSupplierSaveCoreHseqInfo(
          $auditId: String,
          $coreHseqInfo: AuditSupplierCoreHseqInfoInput
        ) {

          auditsSupplierSaveCoreHseqInfo(
            auditId: $auditId,
            coreHseqInfo: $coreHseqInfo
          ) {
            _id
          }
        }
      `,
      'coreHseqInfo',
      true,
    );

    // buyer ========
    await callReplyRecommendMutation(
      `mutation auditsBuyerSaveCoreHseqInfo(
          $auditId: String,
          $supplierId: String,
          $coreHseqInfo: AuditBuyerCoreHseqInfoInput
        ) {

          auditsBuyerSaveCoreHseqInfo(
            auditId: $auditId,
            supplierId: $supplierId,
            coreHseqInfo: $coreHseqInfo
          ) {
            _id
          }
        }
      `,
      'coreHseqInfo',
      false,
    );
  });

  test('audits save hr info', async () => {
    await callReplyRecommendMutation(
      `mutation auditsSupplierSaveHrInfo(
          $auditId: String,
          $hrInfo: AuditSupplierHrInfoInput
        ) {

          auditsSupplierSaveHrInfo(
            auditId: $auditId,
            hrInfo: $hrInfo
          ) {
            _id
          }
        }
      `,
      'hrInfo',
      true,
    );

    await callReplyRecommendMutation(
      `mutation auditsBuyerSaveHrInfo(
          $auditId: String,
          $supplierId: String,
          $hrInfo: AuditBuyerHrInfoInput
        ) {

          auditsBuyerSaveHrInfo(
            auditId: $auditId,
            supplierId: $supplierId,
            hrInfo: $hrInfo
          ) {
            _id
          }
        }
      `,
      'hrInfo',
      false,
    );
  });

  test('audits save business info', async () => {
    await callReplyRecommendMutation(
      `mutation auditsSupplierSaveBusinessInfo(
          $auditId: String,
          $businessInfo: AuditSupplierBusinessInfoInput
        ) {

          auditsSupplierSaveBusinessInfo(
            auditId: $auditId,
            businessInfo: $businessInfo
          ) {
            _id
          }
        }
      `,
      'businessInfo',
      true,
    );

    await callReplyRecommendMutation(
      `mutation auditsBuyerSaveBusinessInfo(
          $auditId: String,
          $supplierId: String,
          $businessInfo: AuditBuyerBusinessInfoInput
        ) {

          auditsBuyerSaveBusinessInfo(
            auditId: $auditId,
            supplierId: $supplierId,
            businessInfo: $businessInfo
          ) {
            _id
          }
        }
      `,
      'businessInfo',
      false,
    );
  });

  test('Send response', async () => {
    await auditResponseFactory({ supplierId: _company._id, auditId: _audit._id });

    const mutation = `
      mutation auditsSupplierSendResponse($auditId: String!) {
        auditsSupplierSendResponse(auditId: $auditId) {
          _id
          isSent
        }
      }
    `;

    const response = await graphqlRequest(
      mutation,
      'auditsSupplierSendResponse',
      { supplierId: _company._id, auditId: _audit._id },
      { user: _user },
    );

    expect(response.isSent).toBe(true);
  });

  test('Save files', async () => {
    await auditResponseFactory({ supplierId: _company._id, auditId: _audit._id });

    const mutation = `
      mutation auditsBuyerSaveFiles(
        $auditId: String!,
        $supplierId: String!,
        $improvementPlan: String,
        $report: String
      ) {

        auditsBuyerSaveFiles(
          auditId: $auditId,
          supplierId: $supplierId,
          improvementPlan: $improvementPlan,
          report: $report
        ) {
          improvementPlanFile,
          reportFile
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });

    const response = await graphqlRequest(
      mutation,
      'auditsBuyerSaveFiles',
      {
        supplierId: _company._id,
        auditId: _audit._id,
        improvementPlan: '/improvementPlanPath',
        report: '/reportPath',
      },
      { user: user },
    );

    expect(response.improvementPlanFile).toBe('/improvementPlanPath');
    expect(response.reportFile).toBe('/reportPath');
  });

  test('Send files', async () => {
    let response = await auditResponseFactory({});

    const mutation = `
      mutation auditsBuyerSendFiles(
        $responseIds: [String]!,
        $improvementPlan: Boolean,
        $report: Boolean
      ) {

        auditsBuyerSendFiles(
          responseIds: $responseIds,
          improvementPlan: $improvementPlan,
          report: $report
        ) {
          improvementPlanSentDate
          reportSentDate
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });

    await graphqlRequest(
      mutation,
      'auditsBuyerSendFiles',
      {
        responseIds: [response._id],
        improvementPlan: true,
        report: true,
      },
      { user: user },
    );

    response = await AuditResponses.findOne({ _id: response._id });

    expect(response.improvementPlanSentDate).toBeDefined();
    expect(response.reportSentDate).toBeDefined();
  });
});
