/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Users, Audits } from '../db/models';
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

    expect.assertions(2);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['audits', 'auditDetail']) {
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
          date
          supplierIds
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

    await auditResponseFactory({ auditId: audit._id, supplierId: _company._id });

    const query = `
      query auditDetail($_id: String!) {
        auditDetail(_id: $_id) {
          _id
          createdUserId
          date
          supplierIds

          createdUser {
            _id
          }

          suppliers {
            _id
          }

          responses {
            _id

            supplier {
              _id
            }

            basicInfo {
              sotri
              sotie
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
    expect(response.responses.length).toBe(1);

    expect(response.responses[0].supplier._id).toBeDefined();

    expect(response.date).toBeDefined();
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
});
