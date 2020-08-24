import { connect, disconnect, graphqlRequest } from '../db/connection';
import { companyDocs, companyFactory, configFactory, userFactory } from '../db/factories';
import { Configs, Users, Companies, DueDiligences } from '../db/models';
import companyMutations from '../data/resolvers/mutations/companies';
import dueDiligenceMutations from '../data/resolvers/mutations/dueDiligences';

beforeAll(() => connect());

afterAll(() => disconnect());

// get company name
const getCompanyName = async supplierId => {
  const company = await Companies.findOne({ _id: supplierId });

  if (company && company.basicInfo) {
    const { enName, mnName } = company.basicInfo;

    return enName || mnName;
  }

  return ' - ';
};

describe('DueDiligence mutations', () => {
  let context, _company;

  beforeEach(async () => {
    _company = await companyFactory({});
    await configFactory();
  });

  afterEach(async () => {
    await Companies.remove();
    await Configs.remove({});
  });

  test('dueDiligencesSave', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(5);

    const mutations = [
      'dueDiligencesSave',
      'dueDiligencesCancel',
      'dueDiligencesEnableState',
      'dueDiligencesUpdate',
      'dueDiligencesRemoveRisk',
    ];

    const user = await userFactory({ companyId: _company._id, isSupplier: true });

    for (let mutation of mutations) {
      await checkLogin(dueDiligenceMutations[mutation], { _company: _company._id }, { user });
    }
  });

  test('dueDiligencesCancel', async () => {
    const supplier = await companyFactory({ isPrequalified: false });

    const response = await graphqlRequest(
      ` mutation dueDiligencesCancel($supplierId: String!){
          dueDiligencesCancel(supplierId: $supplierId){
              _id
              isDueDiligenceEditable
          }
        }`,

      'dueDiligencesCancel',

      { supplierId: supplier._id },

      {
        user: await userFactory({ companyId: _company._id, isSupplier: false }),
      },
    );

    expect(response.isDueDiligenceEditable).toBe(true);
  });

  test('dueDiligencesUpdate', async () => {
    const supplier = await companyFactory({ isPrequalified: false });

    const response = await graphqlRequest(
      ` mutation dueDiligencesUpdate(
          $supplierId: String!
          $files: JSON
          $risk: String
          $date: Date
          $closeDate: Date
          $reminderDay: Int
        ){
          dueDiligencesUpdate(supplierId: $supplierId
            files: $files
            risk: $risk
            date: $date
            closeDate: $closeDate
            reminderDay: $reminderDay
          ){
              _id
              date
              expireDate
              files
              risk
            }
          }`,

      'dueDiligencesUpdate',

      {
        supplierId: supplier._id,
        basicInfo: {
          enName: 'hello',
          mnName: 'amra',
        },
      },
      {
        user: await userFactory({ companyId: _company._id, isSupplier: false }),
      },
    );

    expect(response).toBeDefined();
  });

  test('dueDiligencesEnableState', async () => {
    const supplier = await companyFactory({ isPrequalified: true });

    const response = await graphqlRequest(
      ` mutation dueDiligencesEnableState($supplierId: String!){
          dueDiligencesEnableState(supplierId: $supplierId){
            _id
          }
        }`,

      'dueDiligencesEnableState',

      { supplierId: supplier._id },

      {
        user: await userFactory({ companyId: _company._id, isSupplier: false }),
      },
    );

    expect(response._id).toBe(supplier._id);
  });
  //
  // test('dueDiligencesRemoveRisk', async() => {
  //   const supplier = await companyFactory({isPrequalified: false});
  //   const response = await graphqlRequest(
  //     `mutation dueDiligencesRemoveRisk($supplierId: String!){
  //                         dueDiligencesRemoveRisk(supplierId: $supplierId){
  //                           _id
  //                         }
  //                        }`,
  //     'dueDiligencesRemoveRisk',
  //     {supplierId: supplier._id},
  //     {user: await userFactory({companyId: _company._id})}
  //   );
  //
  //   console.log(response)
  // });
});
