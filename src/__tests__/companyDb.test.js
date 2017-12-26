/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Companies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const toObject = data => {
  return JSON.parse(JSON.stringify(data));
};

describe('Companies model tests', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
  });

  test('Create', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id);

    expect(company).toBeDefined();
    expect(company._id).toBeDefined();

    const updatedUser = await Users.findOne({ _id: user._id });

    expect(updatedUser.companyId).toEqual(company._id);
  });

  test('Update basic info: validations', async () => {
    expect.assertions(2);

    const company = await companyFactory();

    // duplicate english company name
    try {
      await Companies.updateBasicInfo(company._id, { enName: _company.enName });
    } catch (e) {
      expect(e.message).toBe('Duplicated english name');
    }

    // duplicate mongolian company name
    try {
      await Companies.updateBasicInfo(company._id, { enName: 'enName', mnName: _company.mnName });
    } catch (e) {
      expect(e.message).toBe('Duplicated mongolian name');
    }
  });

  test('Update basic info: valid', async () => {
    const company = await companyFactory();

    const doc = {
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
    };

    const updatedCompany = await Companies.updateBasicInfo(company._id, doc);

    expect(toObject(updatedCompany.basicInfo)).toEqual(doc);
  });

  test('Update contact info', async () => {
    const company = await companyFactory();

    const doc = {
      name: 'name',
      address: 'Address',
      address2: 'Address2',
      address3: 'Address3',
      townOrCity: 'Ulaanbaatar',
      province: 'Ulaanbaatar',
      zipCode: 976,
      country: 'Mongolia',
      phone: 24224242,
      phone2: 24224243,
      email: 'contact@gmail.com',
    };

    const updatedCompany = await Companies.updateSection(company._id, 'contactInfo', doc);
    expect(toObject(updatedCompany.contactInfo)).toEqual(doc);
  });

  test('Update management team', async () => {
    const company = await companyFactory();

    const generatePersonDoc = () => {
      return {
        name: `${Math.random()}name`,
        jobTitle: `${Math.random()}jobTitle`,
        phone: Math.random(),
        email: `${Math.random()}@gmail.com`,
      };
    };

    const doc = {
      managingDirector: generatePersonDoc(),
      executiveOfficer: generatePersonDoc(),
      salesDirector: generatePersonDoc(),
      financialDirector: generatePersonDoc(),
      otherMember1: generatePersonDoc(),
      otherMember2: generatePersonDoc(),
      otherMember3: generatePersonDoc(),
    };

    const updatedCompany = await Companies.updateSection(company._id, 'managementTeamInfo', doc);
    expect(toObject(updatedCompany.managementTeamInfo)).toEqual(doc);
  });

  test('Update shareholder info', async () => {
    const company = await companyFactory();

    const generateShareholderDoc = () => {
      return {
        name: `${Math.random()}name`,
        jobTitle: `${Math.random()}jobTitle`,
        percentage: Math.random(),
      };
    };

    const doc = {
      attachments: [{ name: 'name', url: '/path1' }],
      shareholders: [generateShareholderDoc(), generateShareholderDoc()],
    };

    const updatedCompany = await Companies.updateSection(company._id, 'shareholderInfo', doc);
    expect(toObject(updatedCompany.shareholderInfo)).toEqual(doc);
  });

  test('Update group info', async () => {
    const company = await companyFactory();

    const generateFactoryDoc = () => {
      return {
        name: `${Math.random()}name`,
        townOrCity: `${Math.random()}townOrCity`,
        country: `${Math.random()}country`,
        productCodes: ['code'],
      };
    };

    const doc = {
      hasParent: true,
      isParentExistingSup: true,
      parentName: 'parentName',
      parentAddress: 'parentAddress',
      parentRegistrationNumber: 'parentRegistrationNumber',
      role: 'manufacturer',
      isExclusiveDistributor: false,
      authorizedDistributions: ['1', '2'],
      attachments: [{ name: 'name', url: '/path1' }],
      primaryManufacturerName: 'primaryManufacturerName',
      countryOfPrimaryManufacturer: 'countryOfPrimaryManufacturer',
      factories: [generateFactoryDoc()],
    };

    const updatedCompany = await Companies.updateSection(company._id, 'groupInfo', doc);
    expect(toObject(updatedCompany.groupInfo)).toEqual(doc);
  });

  test('Update products info', async () => {
    const company = await companyFactory();

    const productCodes = ['a10', 'c12'];

    const updatedCompany = await Companies.updateSection(company._id, 'productsInfo', productCodes);
    expect(toObject(updatedCompany.productsInfo)).toEqual(productCodes);
  });

  test('Update certificate info', async () => {
    const company = await companyFactory();

    const doc = {
      isReceived: true,
      file: { name: 'name', url: 'url' },
    };

    const updatedCompany = await Companies.updateSection(company._id, 'certificateInfo', doc);
    expect(toObject(updatedCompany.certificateInfo)).toEqual(doc);
  });

  test('Update Financial Info', async () => {
    const company = await companyFactory();

    const doc = {
      canProvideAccountsInfo: true,
      reasonToCannotNotProvide: 'I dont know',
      currency: 'Euro (EUR)',
      annualTurnover: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      preTaxProfit: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      totalAssets: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      totalCurrentAssets: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      totalShareholderEquity: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      recordsInfo: [
        { date: '2010/10/1', file: { name: 'name', url: 'path1' } },
        { date: '2008/10/05', file: { name: 'name', url: 'path2' } },
      ],
      isUpToDateSSP: true,
      isUpToDateCTP: true,
    };

    const updatedCompany = await Companies.updateSection(company._id, 'financialInfo', doc);

    expect(toObject(updatedCompany.financialInfo)).toEqual(doc);
  });

  test('Update Business integrity and Human resource', async () => {
    const company = await companyFactory();

    const doc = {
      doesMeetMinimumStandarts: true,
      doesMeetMinimumStandartsFile: { name: 'name', url: 'url' },
      doesHaveJobDescription: true,
      doesHaveJobDescriptionFile: { name: 'name', url: 'url' },
      doesConcludeValidContracts: true,
      employeeTurnoverRate: 12,
      doesHaveLiabilityInsurance: false,
      doesHaveLiabilityInsuranceFile: { name: 'name', url: 'url' },
      doesHaveCodeEthics: true,
      doesHaveCodeEthicsFile: { name: 'name', url: 'url' },
      doesHaveResponsiblityPolicy: true,
      doesHaveResponsiblityPolicyFile: { name: 'name', url: 'url' },
      hasConvictedLabourLaws: true,
      hasConvictedForHumanRights: true,
      hasConvictedForBusinessIntegrity: false,
      proveHasNotConvicted: 'Lorem ipsum',
      hasLeadersConvicted: true,
      investigations: [
        { name: 'Name', date: '2010.01.01', status: 'Status', statusDate: '2011.01.01' },
      ],
      doesEmployeePoliticallyExposed: true,
      pepName: 'Lorem ipsum',
      organizationChartFile: { name: 'name', url: 'url' },
    };

    const updatedCompany = await Companies.updateSection(company._id, 'businessInfo', doc);
    expect(toObject(updatedCompany.businessInfo)).toEqual(doc);
  });

  test('Update environmental management', async () => {
    const company = await companyFactory();

    const doc = {
      doesHavePlan: true,
      doesHavePlanFile: { name: 'name', url: 'url' },
      hasEnvironmentalRegulatorInvestigated: true,
      dateOfInvestigation: '2010.01.01',
      reasonForInvestigation: 'Lorem ipsum',
      actionStatus: 'In Progress',
      investigationDocumentation: { name: 'name', url: 'path1' },
      hasConvictedForEnvironmentalLaws: true,
      proveHasNotConvicted: 'Lorem ipsum',
    };

    const updatedCompany = await Companies.updateSection(company._id, 'environmentalInfo', doc);
    expect(toObject(updatedCompany.environmentalInfo)).toEqual(doc);
  });

  test('Update health and safety management system', async () => {
    const company = await companyFactory();

    const doc = {
      doesHaveHealthSafety: true,
      doesHaveHealthSafetyFile: { name: 'name', url: 'url' },
      areHSEResourcesClearlyIdentified: true,
      doesHaveDocumentedProcessToEnsure: true,
      doesHaveDocumentedProcessToEnsureFile: { name: 'name', url: 'url' },
      areEmployeesUnderYourControl: true,
      doesHaveDocumentForRiskAssesment: true,
      doesHaveDocumentForRiskAssesmentFile: { name: 'name', url: 'url' },
      doesHaveDocumentForIncidentInvestigation: false,
      doesHaveDocumentForIncidentInvestigationFile: { name: 'name', url: 'url' },
      doesHaveDocumentedFitness: false,
      doesHaveDocumentedFitnessFile: { name: 'name', url: 'url' },
      isWillingToComply: false,
      hasIndustrialAccident: false,
      tmha: 'tmha',
      ltifr: 'ltifr',
      injuryExplanation: 'injuryExplanation',
      seniorManagement: 'seniorManagement',
      isWillingToCommit: true,
      isPerparedToCompile: true,
      hasWorkedOnWorldBank: true,
      hasWorkedOnWorldBankDescription: 'description',
      hasWorkedOnLargeProjects: true,
      hasWorkedOnLargeProjectsDescription: 'description',
      doesHaveLicense: true,
      doesHaveLicenseDescription: 'description',
    };

    const updatedCompany = await Companies.updateSection(company._id, 'healthInfo', doc);

    expect(toObject(updatedCompany.healthInfo)).toEqual(doc);
  });
});
