/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Users, Audits, AuditResponses } from '../db/models';
import { userFactory, companyFactory, auditFactory, auditResponseFactory } from '../db/factories';
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

    expect.assertions(4);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['audits', 'auditDetail', 'auditResponses', 'auditResponseDetail']) {
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

            evidenceInfo {
              doesHaveHealthSafety
              doesHaveDrugPolicy
              doesPerformPreemployment
              workProceduresConform
              doesHaveFormalProcessForHSE
              doesHaveSystemForTracking
              doesHaveValidCertifications
              doesHaveSystemForReporting
              doesHaveLiabilityInsurance
              doesHaveFormalProcessForHealth
              isThereCurrentContract
              doesHaveJobDescription
              doesHaveTraining
              doesHaveEmployeeRelatedProcedure
              doesHaveTimeKeeping
              doesHavePerformancePolicy
              doesHaveProcessToSupport
              employeesAwareOfRights
              doesHaveSystemToEnsureSafeWork
              doesHaveEmployeeSelectionProcedure
              doesHaveEmployeeLaborProcedure
              doesHaveGrievancePolicy
              proccessToEnsurePolicesCompany
              proccessToEnsurePolicesSupplyChain
              hasBeenSubjectToInvestigation
              doesHaveCorruptionPolicy
              whoIsResponsibleForCorruptionPolicy
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

  test('audit responses', async () => {
    await AuditResponses.remove({});

    const query = `
      query auditResponses {
        auditResponses {
          _id
          auditId
        }
      }
    `;

    await auditResponseFactory({});

    const response = await graphqlRequest(query, 'auditResponses');

    expect(response.length).toBe(1);
  });
});
