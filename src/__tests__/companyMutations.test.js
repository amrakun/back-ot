/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory, companyDocs } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company mutations', () => {
  let _company;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
  });

  const callMutation = async (mutation, name) => {
    Companies.updateSection = jest.fn(() => ({ _id: 'DFAFDA' }));

    const context = {
      user: await userFactory({ companyId: _company._id }),
    };

    const doc = companyDocs[name]();
    const key = `${name}Info`;

    await graphqlRequest(mutation, key, { [key]: doc }, context);

    expect(Companies.updateSection.mock.calls.length).toBe(1);
    expect(Companies.updateSection).toBeCalledWith(_company._id, key, doc);
  };

  test('companiesEditBasicInfo', async () => {
    const mutation = `
      mutation companiesEditBasicInfo($basicInfo: CompanyBasicInfoInput) {
        companiesEditBasicInfo(basicInfo: $basicInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'basic');
  });

  test('companiesEditContactInfo', async () => {
    const mutation = `
      mutation companiesEditContactInfo($contactInfo: CompanyContactInfoInput) {
        companiesEditContactInfo(contactInfo: $contactInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'contact');
  });

  test('companiesEditManagementTeamInfo', async () => {
    const mutation = `
      mutation companiesEditManagementTeamInfo(
        $managementTeamInfo: CompanyManagementTeamInfoInput
      ) {
        companiesEditManagementTeamInfo(managementTeamInfo: $managementTeamInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'managementTeam');
  });

  test('companiesEditShareholderInfo', async () => {
    const mutation = `
      mutation companiesEditShareholderInfo(
        $shareholderInfo: CompanyShareholderInfoInput
      ) {
        companiesEditShareholderInfo(shareholderInfo: $shareholderInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'shareholder');
  });

  test('companiesEditGroupInfo', async () => {
    const mutation = `
      mutation companiesEditGroupInfo(
        $groupInfo: CompanyGroupInfoInput
      ) {
        companiesEditGroupInfo(groupInfo: $groupInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'group');
  });

  test('companiesEditProductsInfo', async () => {
    const mutation = `
      mutation companiesEditProductsInfo(
        $productsInfo: [String]
      ) {
        companiesEditProductsInfo(productsInfo: $productsInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'products');
  });

  test('companiesEditCertificateInfo', async () => {
    const mutation = `
      mutation companiesEditCertificateInfo(
        $certificateInfo: CompanyCertificateInfoInput
      ) {
        companiesEditCertificateInfo(certificateInfo: $certificateInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'certificate');
  });

  test('companiesEditFinancialInfo', async () => {
    const mutation = `
      mutation companiesEditFinancialInfo(
        $financialInfo: CompanyFinancialInfoInput
      ) {
        companiesEditFinancialInfo(financialInfo: $financialInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'financial');
  });

  test('companiesEditBusinessInfo', async () => {
    const mutation = `
      mutation companiesEditBusinessInfo(
        $businessInfo: CompanyBusinessInfoInput
      ) {
        companiesEditBusinessInfo(businessInfo: $businessInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'business');
  });

  test('companiesEditEnvironmentalInfo', async () => {
    const mutation = `
      mutation companiesEditEnvironmentalInfo(
        $environmentalInfo: CompanyEnvironmentalInfoInput
      ) {
        companiesEditEnvironmentalInfo(environmentalInfo: $environmentalInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'environmental');
  });

  test('companiesEditHealthInfo', async () => {
    const mutation = `
      mutation companiesEditHealthInfo(
        $healthInfo: CompanyHealthInfoInput
      ) {
        companiesEditHealthInfo(healthInfo: $healthInfo) {
          _id
        }
      }
    `;

    await callMutation(mutation, 'health');
  });

  test('add difot score', async () => {
    const sup1 = await companyFactory({
      difotScores: [{ date: new Date(), amount: 1 }],
      averageDifotScore: 1,
    });

    const sup2 = await companyFactory();

    const mutation = `
      mutation companiesAddDifotScores($difotScores: [CompanyDifotScoreInput]!) {
        companiesAddDifotScores(difotScores: $difotScores) {
          _id
        }
      }
    `;

    const context = {
      user: await userFactory({ companyId: _company._id }),
    };

    const difotScores = [
      { supplierName: sup1.basicInfo.enName, date: new Date(), amount: 10 },
      { supplierName: sup2.basicInfo.enName, date: new Date(), amount: 11 },
    ];

    await graphqlRequest(mutation, 'companiesAddDifotScores', { difotScores }, context);

    const updatedSup1 = await Companies.findOne({ _id: sup1._id });
    const updatedSup2 = await Companies.findOne({ _id: sup2._id });

    expect(updatedSup1.difotScores.length).toBe(2);
    expect(updatedSup1.averageDifotScore).toBe(5.5);

    expect(updatedSup2.difotScores.length).toBe(1);
    expect(updatedSup2.averageDifotScore).toBe(11);
  });

  test('add due diligence', async () => {
    const supplier = await companyFactory({
      dueDiligences: [{ date: new Date(), file: { url: '/path1' } }],
    });

    const mutation = `
      mutation companiesAddDueDiligences($dueDiligences: [CompanyDueDiligenceInput]!) {
        companiesAddDueDiligences(dueDiligences: $dueDiligences) {
          _id
        }
      }
    `;

    const context = {
      user: await userFactory({ companyId: _company._id }),
    };

    const dueDiligences = [{ supplierId: supplier._id, file: { url: '/path2' } }];

    await graphqlRequest(mutation, 'companiesAddDueDiligences', { dueDiligences }, context);

    const updatedSupplier = await Companies.findOne({ _id: supplier._id });

    expect(updatedSupplier.dueDiligences.length).toBe(2);
  });

  test('validate products info', async () => {
    const supplier = await companyFactory({ productsInfo: ['code1', 'code2'] });

    const mutation = `
      mutation companiesValidateProductsInfo($_id: String!, $codes: [String]!) {
        companiesValidateProductsInfo(_id: $_id, codes: $codes) {
          _id
        }
      }
    `;

    const context = {
      user: await userFactory({ companyId: _company._id }),
    };

    const codes = ['code1', 'code2'];

    await graphqlRequest(
      mutation,
      'companiesValidateProductsInfo',
      { _id: supplier._id, codes },
      context,
    );

    const updatedSupplier = await Companies.findOne({ _id: supplier._id });

    expect(updatedSupplier.validatedProductsInfo).toContain('code1');
    expect(updatedSupplier.validatedProductsInfo).toContain('code2');
  });

  test('block a company', async () => {
    const supplier = await companyFactory({});

    const blockMutation = `
      mutation companiesBlock(
        $supplierIds: [String!]!
        $startDate: Date!
        $endDate: Date!
        $note: String
      ) {
        companiesBlock(
          supplierIds: $supplierIds
          startDate: $startDate
          endDate: $endDate
          note: $note
        )
      }
    `;

    const doc = {
      supplierIds: [supplier._id],
      startDate: new Date(),
      endDate: new Date(),
      note: 'note',
    };

    const context = {
      user: await userFactory(),
    };

    await graphqlRequest(blockMutation, 'companiesBlock', doc, context);

    expect(await BlockedCompanies.find().count()).toBe(1);

    const blockedCompany = await BlockedCompanies.findOne();

    expect(blockedCompany.createdUserId).toBe(context.user._id);

    // unblock  =====================
    const unblockMutation = `
      mutation companiesUnblock($supplierIds: [String!]!) {
        companiesUnblock(supplierIds: $supplierIds)
      }
    `;

    const unblockDoc = { supplierIds: [blockedCompany.supplierId] };

    await graphqlRequest(unblockMutation, 'companiesUnblock', unblockDoc, context);

    expect(await BlockedCompanies.find().count()).toBe(0);
  });
});
