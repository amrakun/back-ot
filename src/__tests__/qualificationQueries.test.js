/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Users, Qualifications } from '../db/models';
import { userFactory, companyFactory, qualificationFactory } from '../db/factories';
import queries from '../data/resolvers/queries/qualifications';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Qualification queries', () => {
  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Users.remove({});
    await Qualifications({});
  });

  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(1);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['qualificationDetail']) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('qualificationDetail', async () => {
    const query = `
      query qualificationDetail($supplierId: String!) {
        qualificationDetail(supplierId: $supplierId) {
          company {
            basicInfo {
              enName
            }
          }
          financialInfo {
            canProvideAccountsInfo
          }
        }
      }
    `;

    const user = await userFactory({ isSupplier: false });
    const company = await companyFactory({ enName: 'testName' });
    const supplierId = company._id;

    await qualificationFactory({
      supplierId,
      financialInfo: {
        canProvideAccountsInfo: true,
        reasonToCannotNotProvide: true,
        currency: true,
        annualTurnover: true,
        preTaxProfit: true,
        totalAssets: true,
        totalCurrentAssets: true,
        totalShareholderEquity: true,
        recordsInfo: true,
        isUpToDateSSP: true,
        isUpToDateCTP: true,
      },
    });

    let qualification = await graphqlRequest(
      query,
      'qualificationDetail',
      { supplierId },
      { user },
    );

    expect(qualification.financialInfo.canProvideAccountsInfo).toBe(true);
    expect(qualification.company.basicInfo.enName).toBe('testName');
  });
});
