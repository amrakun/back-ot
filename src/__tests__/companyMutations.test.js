/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';

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

  test('companiesEditBasicInfo', async () => {
    Companies.updateSection = jest.fn(() => ({ _id: 'DFAFDA' }));

    const doc = {
      basicInfo: {
        enName: 'enNameUpdated',
        mnName: 'mnNameUpdated',
        sapNumber: 'sapNumber',
        isRegisteredOnSup: false,
        address: 'AddressUpdated',
        address2: 'Address2Updated',
        address3: 'Address3Updated',
        townOrCity: 'UlaanbaatarUpdated',
        province: 'UlaanbaatarUpdated',
        zipCode: 977,
        country: 'MongoliaUpdated',
        registeredInCountry: 'MongoliaUpdated',
        registeredInAimag: 'UmnugivUpdated',
        registeredInSum: 'BayntsagaanUpdated',
        isChinese: true,
        isSubContractor: false,
        corporateStructure: 'PartnershipUpdated',
        registrationNumber: 33483948394,
        certificateOfRegistration: { name: 'name', url: '/path' },
        email: 'companyUpdated@gmail.com',
        website: 'web.com',
        foreignOwnershipPercentage: '41',
        totalNumberOfEmployees: 101,
        totalNumberOfMongolianEmployees: 81,
        totalNumberOfUmnugoviEmployees: 11,
      },
    };

    const mutation = `
      mutation companiesEditBasicInfo($basicInfo: CompanyBasicInfoInput) {
        companiesEditBasicInfo(basicInfo: $basicInfo) {
          _id
        }
      }
    `;

    const context = {
      user: await userFactory({ companyId: _company._id }),
    };

    await graphqlRequest(mutation, 'companiesEditBasicInfo', doc, context);

    expect(Companies.updateSection.mock.calls.length).toBe(1);
    expect(Companies.updateSection).toBeCalledWith(_company._id, 'basicInfo', doc.basicInfo);
  });
});
