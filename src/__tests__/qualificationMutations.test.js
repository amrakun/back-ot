/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Companies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from '../db/models/Companies';
import qualificationMutations from '../data/resolvers/mutations/qualifications';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company mutations', () => {
  let _company;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Companies.remove({});
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
      'qualificationsSaveFinancialInfo',
      'qualificationsSaveBusinessInfo',
      'qualificationsSaveEnvironmentalInfo',
      'qualificationsSaveHealthInfo',
      'qualificationsSaveTierType',
      'qualificationsPrequalify',
    ];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(qualificationMutations[mutation], {}, { user });
    }
  });

  /*
   * Common section update checker
   */
  const callMutation = async ({ mutationName, inputName, sectionName, schema }) => {
    // generate section params ==========
    const sectionParams = {};

    Object.keys(schema.paths).forEach((name, index) => {
      sectionParams[name] = index % 2 === 0;
    });

    const params = {
      supplierId: [_company._id],
      [sectionName]: sectionParams,
    };

    const context = { user: _user };

    const fieldsToSelect = Object.keys(schema.paths);

    const mutation = `
      mutation ${mutationName}($supplierId: String!, $${sectionName}: ${inputName}) {
        ${mutationName} (supplierId: $supplierId, ${sectionName}: $${sectionName}) {
          ${sectionName} {
            ${fieldsToSelect}
          }
        }
      }
    `;

    const res = await graphqlRequest(mutation, mutationName, params, context);

    expect(res[sectionName]).toEqual(params[sectionName]);
  };

  test('financial info', async () => {
    callMutation({
      mutationName: 'qualificationsSaveFinancialInfo',
      inputName: 'QualificationFinancialInfoInput',
      sectionName: 'financialInfo',
      schema: FinancialInfoSchema,
    });
  });

  test('business info', async () => {
    callMutation({
      mutationName: 'qualificationsSaveBusinessInfo',
      inputName: 'QualificationBusinessInfoInput',
      sectionName: 'businessInfo',
      schema: BusinessInfoSchema,
    });
  });

  test('environmental info', async () => {
    callMutation({
      mutationName: 'qualificationsSaveEnvironmentalInfo',
      inputName: 'QualificationEnvironmentalInfoInput',
      sectionName: 'environmentalInfo',
      schema: EnvironmentalInfoSchema,
    });
  });

  test('health info', async () => {
    callMutation({
      mutationName: 'qualificationsSaveHealthInfo',
      inputName: 'QualificationHealthInfoInput',
      sectionName: 'healthInfo',
      schema: HealthInfoSchema,
    });
  });

  test('tier type', async () => {
    const mutation = `
      mutation qualificationsSaveTierType($supplierId: String!, $tierType: String! ) {
        qualificationsSaveTierType(supplierId: $supplierId, tierType: $tierType) {
          tierType
        }
      }
    `;

    const params = {
      supplierId: [_company._id],
      tierType: 'national',
    };

    const context = { user: _user };

    const res = await graphqlRequest(mutation, 'qualificationsSaveTierType', params, context);

    expect(res.tierType).toBe('national');
  });

  test('Prequalify a supplier', async () => {
    expect(_company.isPrequalified).not.toBeDefined();

    const mutation = `
      mutation qualificationsPrequalify($supplierId: String!, $qualified: Boolean) {
        qualificationsPrequalify(supplierId: $supplierId, qualified: $qualified) {
          isPrequalified
        }
      }
    `;

    const response = await graphqlRequest(
      mutation,
      'qualificationsPrequalify',
      { supplierId: _company._id, qualified: true },
      { user: _user },
    );

    expect(response.isPrequalified).toBe(true);
  });
});
