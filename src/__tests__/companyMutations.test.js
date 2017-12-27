/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';
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
});
