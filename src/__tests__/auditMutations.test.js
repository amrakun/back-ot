/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Audits, Companies } from '../db/models';

import { userFactory, companyFactory, auditFactory, auditResponseDocs } from '../db/factories';

import companyMutations from '../data/resolvers/mutations/audits';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Audit mutations', () => {
  let _company;
  let _audit;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory();
    _audit = await auditFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Audits.remove({});
  });

  test('Supplier required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(3);

    const mutations = [
      'auditsSupplierSaveCoreHseqInfo',
      'auditsSupplierSaveHrInfo',
      'auditsSupplierSaveBusinessInfo',
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

    expect.assertions(3);

    const mutations = [
      'auditsBuyerSaveCoreHseqInfo',
      'auditsBuyerSaveHrInfo',
      'auditsBuyerSaveBusinessInfo',
    ];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(companyMutations[mutation], {}, { user });
    }
  });

  const callReplyRecommendMutation = async (mutation, name, isSupplier) => {
    Audits.saveReplyRecommentSection = jest.fn(() => ({ _id: 'DFAFDA' }));

    const context = {
      user: await userFactory({ companyId: _company._id, isSupplier }),
    };

    let docGeneratorArgs = [true, false];

    if (!isSupplier) {
      docGeneratorArgs = [false, true];
    }

    const args = {
      supplierId: _company._id,
      auditId: _audit._id,
      [name]: auditResponseDocs[name](...docGeneratorArgs),
    };

    await graphqlRequest(mutation, name, args, context);

    expect(Audits.saveReplyRecommentSection.mock.calls.length).toBe(1);

    expect(Audits.saveReplyRecommentSection).toBeCalledWith({
      supplierId: args.supplierId,
      auditId: args.auditId,
      name,
      doc: args[name],
    });
  };

  test('audits save core hseq info', async () => {
    const callCoreHseqMutation = (name, input, isSupplier) => {
      const mutation = `
        mutation ${name}(
          $auditId: String,
          $supplierId: String,
          $coreHseqInfo: ${input}
        ) {

          ${name}(
            auditId: $auditId,
            supplierId: $supplierId,
            coreHseqInfo: $coreHseqInfo
          ) {
            _id
          }
        }
      `;

      return callReplyRecommendMutation(mutation, 'coreHseqInfo', isSupplier);
    };

    // supplier =======
    await callCoreHseqMutation(
      'auditsSupplierSaveCoreHseqInfo',
      'AuditSupplierCoreHseqInfoInput',
      true,
    );

    await callCoreHseqMutation('auditsBuyerSaveCoreHseqInfo', 'AuditBuyerCoreHseqInfoInput', false);
  });

  test('audits save hr info', async () => {
    const callHrMutation = (name, input, isSupplier) => {
      const mutation = `
        mutation ${name}(
          $auditId: String,
          $supplierId: String,
          $hrInfo: ${input}
        ) {

          ${name}(
            auditId: $auditId,
            supplierId: $supplierId,
            hrInfo: $hrInfo
          ) {
            _id
          }
        }
      `;

      return callReplyRecommendMutation(mutation, 'hrInfo', isSupplier);
    };

    // supplier =======
    await callHrMutation('auditsSupplierSaveHrInfo', 'AuditSupplierHrInfoInput', true);

    await callHrMutation('auditsBuyerSaveHrInfo', 'AuditBuyerHrInfoInput', false);
  });

  test('audits save business info', async () => {
    const callBusinessMutation = (name, input, isSupplier) => {
      const mutation = `
        mutation ${name}(
          $auditId: String,
          $supplierId: String,
          $businessInfo: ${input}
        ) {

          ${name}(
            auditId: $auditId,
            supplierId: $supplierId,
            businessInfo: $businessInfo
          ) {
            _id
          }
        }
      `;

      return callReplyRecommendMutation(mutation, 'businessInfo', isSupplier);
    };

    // supplier =======
    await callBusinessMutation(
      'auditsSupplierSaveBusinessInfo',
      'AuditSupplierBusinessInfoInput',
      true,
    );

    await callBusinessMutation('auditsBuyerSaveBusinessInfo', 'AuditBuyerBusinessInfoInput', false);
  });
});
