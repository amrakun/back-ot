/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Users, Audits, AuditResponses } from '../db/models';
import {
  userFactory,
  companyFactory,
  auditFactory,
  auditResponseFactory,
  auditResponseDocs,
} from '../db/factories';
import queries from '../data/resolvers/queries/audits';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Audits.remove({});
    await AuditResponses.remove({});
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

    expect.assertions(7);

    const user = await userFactory({ isSupplier: true });

    const items = [
      'audits',
      'auditsSuppliers',
      'auditDetail',
      'auditResponses',
      'auditResponseTotalCounts',
      'auditResponsesQualifiedStatus',
      'auditResponseDetail',
    ];

    for (let query of items) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('Suppiler required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(1);

    const user = await userFactory({ isSupplier: false });

    for (let query of ['auditResponseByUser']) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('audits', async () => {
    const query = `
      query audits {
        audits {
          _id
          createdUserId
          supplierIds
          status
          publishDate
          closeDate
        }
      }
    `;

    await auditFactory({});
    await auditFactory({});

    const response = await graphqlRequest(query, 'audits', {});

    expect(response.length).toBe(2);
  });

  test('audit detail', async () => {
    const user = await userFactory({ isSupplier: false });

    const audit = await auditFactory({
      createdUserId: user._id,
      supplierIds: [_company._id],
    });

    await auditResponseFactory({
      auditId: audit._id,
      supplierId: _company._id,
      isSent: true,
    });

    const query = `
      query auditDetail($_id: String!) {
        auditDetail(_id: $_id) {
          _id
          createdUserId
          supplierIds
          status
          publishDate
          closeDate

          createdUser {
            _id
          }

          suppliers {
            _id
          }

          supplierResponse {
            status
          }

          responses {
            _id
            status

            supplier {
              _id
            }

            basicInfo {
              sotri
              sotie
              otExperience
            }

            coreHseqInfo {
              doesHaveHealthSafety { supplierComment }
              doesHaveDocumentedPolicy { supplierComment }
              doesPerformPreemployment { supplierComment }
              doWorkProceduresConform { supplierComment }
              doesHaveTrackingSystem { supplierComment }
              doesHaveValidIndustry { supplierComment }
              doesHaveFormalProcessForReporting { supplierComment }
              doesHaveLiabilityInsurance { supplierComment }
              doesHaveFormalProcessForHealth { supplierComment }
            }

            hrInfo {
              workContractManagement { supplierComment }
              jobDescriptionProcedure { supplierComment }
              trainingDevelopment { supplierComment }
              employeePerformanceManagement { supplierComment }
              timeKeepingManagement { supplierComment }
              managementOfPractises { supplierComment }
              managementOfWorkforce { supplierComment }
              employeeAwareness { supplierComment }
              employeeSelection { supplierComment }
              employeeExitManagement { supplierComment }
              grievanceAndFairTreatment { supplierComment }
            }

            businessInfo {
              doesHavePolicyStatement { supplierComment }
              ensureThroughoutCompany { supplierComment }
              ensureThroughoutSupplyChain { supplierComment }
              haveBeenSubjectToInvestigation { supplierComment }
              doesHaveDocumentedPolicyToCorruption { supplierComment }
              whoIsResponsibleForPolicy { supplierComment }
            }
          }
        }
      }
    `;

    const args = { _id: audit._id };
    const context = { user };
    const response = await graphqlRequest(query, 'auditDetail', args, context);

    expect(response.createdUser._id).toBe(user._id);

    expect(response.suppliers.length).toBe(1);
    expect(response.suppliers[0]._id).toBeDefined();

    expect(response.responses.length).toBe(1);
    expect(response.responses[0].supplier._id).toBeDefined();

    expect(response.status).toBeDefined();
    expect(response.publishDate).toBeDefined();
    expect(response.closeDate).toBeDefined();
  });

  test('audit response by user', async () => {
    const query = `
      query auditResponseByUser($auditId: String!) {
        auditResponseByUser(auditId: $auditId) {
          _id
          auditId
        }
      }
    `;

    const user = await userFactory({ companyId: _company._id, isSupplier: true });
    const auditResponse = await auditResponseFactory({ supplierId: user.companyId });
    await Audits.update({ _id: auditResponse.auditId }, { $set: { supplierIds: user.companyId } });

    const args = { auditId: auditResponse.auditId };
    const context = { user };
    const response = await graphqlRequest(query, 'auditResponseByUser', args, context);

    expect(response.auditId).toBe(args.auditId);
  });

  test('auditResponseDetail', async () => {
    const query = `
      query auditResponseDetail($auditId: String!, $supplierId: String!) {
        auditResponseDetail(auditId: $auditId, supplierId: $supplierId) {
          _id
          auditId
          supplierId

          improvementPlanFile
          reportFile

          isQualified

          audit {
            _id
          }
        }
      }
    `;

    const auditResponse = await auditResponseFactory();

    const args = {
      auditId: auditResponse.auditId,
      supplierId: auditResponse.supplierId,
    };

    const context = { user: await userFactory({ isSupplier: false }) };

    const response = await graphqlRequest(query, 'auditResponseDetail', args, context);

    expect(response.auditId).toBe(args.auditId);
    expect(response.supplierId).toBe(args.supplierId);
    expect(response.audit._id).toBeDefined();
  });

  const auditResponsesQuery = `
    query auditResponses(
      $supplierSearch: String
      $publishDate: Date
      $closeDate: Date
      $supplierStatus: String
    ) {
      auditResponses(
        supplierSearch: $supplierSearch
        publishDate: $publishDate
        closeDate: $closeDate
        supplierStatus: $supplierStatus
      ) {
        _id
        auditId

        supplier {
          basicInfo {
            enName
            sapNumber
          }
        }
      }
    }
  `;

  const doResponsesQuery = args => graphqlRequest(auditResponsesQuery, 'auditResponses', args);

  test('audit responses', async () => {
    const supplier = await companyFactory({
      enName: 'enName',
      sapNumber: 'number',
    });

    // response 1 ===
    const audit1 = await auditFactory({
      publishDate: moment(),
      closeDate: moment().add(1, 'days'),
    });

    await auditResponseFactory({
      isSent: true,
      auditId: audit1._id,
      reportFile: '/path',
      status: 'late',
    });

    // respose 2 ===
    const audit2 = await auditFactory({
      publishDate: moment().add(-9, 'days'),
      closeDate: moment().add(-10, 'days'),
    });

    await auditResponseFactory({
      isSent: true,
      supplierId: supplier._id,
      auditId: audit2._id,
      status: 'onTime',
    });

    // supplier search ===================
    let args = { supplierSearch: 'enName' };
    let response = await doResponsesQuery(args);

    expect(response.length).toBe(1);

    // dates search ===================
    args = {
      publishDate: moment().add(-1, 'days'),
      closeDate: moment().add(2, 'days'),
    };

    response = await doResponsesQuery(args);

    expect(response.length).toBe(1);

    // status search ===================
    args = { supplierStatus: 'onTime' };
    response = await doResponsesQuery(args);

    expect(response.length).toBe(1);
  });

  test('audit totals', async () => {
    const query = `
      query auditResponseTotalCounts {
        auditResponseTotalCounts {
          invited
          notResponded
          qualified
          sentImprovementPlan
          notNotified
        }
      }
    `;

    const sup1 = await companyFactory({});
    const sup2 = await companyFactory({});
    const sup3 = await companyFactory({});
    const sup4 = await companyFactory({});

    const audit1 = await auditFactory({ supplierIds: [sup1._id, sup2._id] });
    const audit2 = await auditFactory({ supplierIds: [sup3._id, sup4._id] });

    await auditResponseFactory({
      auditId: audit1._id,
      supplierId: sup1._id,
      isSent: true,
    });

    await auditResponseFactory({
      auditId: audit2._id,
      supplierId: sup4._id,
      isSent: true,
    });

    await auditResponseFactory({
      isQualified: true,
      notificationForBuyer: '',
      isSent: true,
    });

    await auditResponseFactory({
      isQualified: true,
      notificationForBuyer: '',
      isSent: true,
    });

    await auditResponseFactory({
      improvementPlanSentDate: new Date(),
      notificationForBuyer: '',
      isSent: true,
    });

    const response = await graphqlRequest(query, 'auditResponseTotalCounts', {});

    expect(response.invited).toBe(7);

    // audit1 - 1, audit2 - 1
    expect(response.notResponded).toBe(2);

    expect(response.qualified).toBe(2);
    expect(response.sentImprovementPlan).toBe(1);
    expect(response.notNotified).toBe(2);
  });

  test('auditResponsesQualifiedStatus', async () => {
    const qry = `
      query auditResponsesQualifiedStatus {
        auditResponsesQualifiedStatus
      }
    `;

    // core hseq info ===========
    const coreHseqInfo = auditResponseDocs.coreHseqInfo(false, true);
    await auditResponseFactory({ isSent: true });
    await auditResponseFactory({ isSent: true, coreHseqInfo });
    await auditResponseFactory({ isSent: true, coreHseqInfo });
    await auditResponseFactory({ isSent: true, coreHseqInfo });

    // business info ===========
    const businessInfo = auditResponseDocs.businessInfo(false, true);
    await auditResponseFactory({ isSent: true, businessInfo });
    await auditResponseFactory({ isSent: true, businessInfo });

    // hr info ===========
    const hrInfo = auditResponseDocs.hrInfo(false, true);
    await auditResponseFactory({ isSent: true, hrInfo });
    await auditResponseFactory({ isSent: true, hrInfo });

    const response = await graphqlRequest(qry, 'auditResponsesQualifiedStatus', {});

    expect(response.coreHseqInfo).toBe(3);
    expect(response.businessInfo).toBe(2);
    expect(response.hrInfo).toBe(2);
  });

  test('audit response qualified status object', async () => {
    const qry = `
      query auditResponseByUser($auditId: String!) {
        auditResponseByUser(auditId: $auditId) {
          qualifiedStatus
        }
      }
    `;

    const user = await userFactory({ isSupplier: true });
    const audit = await auditFactory({ supplierIds: [user.companyId] });

    await auditResponseFactory({
      supplierId: user.companyId,
      auditId: audit._id,
      coreHseqInfo: auditResponseDocs.coreHseqInfo(false, true),
      businessInfo: auditResponseDocs.businessInfo(false, true),
      hrInfo: auditResponseDocs.hrInfo(false, true),
    });

    const response = await graphqlRequest(
      qry,
      'auditResponseByUser',
      { auditId: audit._id },
      { user },
    );

    expect(response.qualifiedStatus.coreHseqInfo).toBe(true);
    expect(response.qualifiedStatus.businessInfo).toBe(true);
    expect(response.qualifiedStatus.hrInfo).toBe(true);
  });
});
