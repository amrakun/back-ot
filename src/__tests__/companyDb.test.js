/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';
import { companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const checkBasicInfo = (basicInfo, doc) => {
  expect(basicInfo.enName).toBe(doc.enName);
  expect(basicInfo.mnName).toBe(doc.mnName);
  expect(basicInfo.sapNumber).toBe(doc.sapNumber);
  expect(basicInfo.isRegisteredOnSup).toBe(doc.isRegisteredOnSup);
  expect(basicInfo.address).toBe(doc.address);
  expect(basicInfo.address2).toBe(doc.address2);
  expect(basicInfo.townOrCity).toBe(doc.townOrCity);
  expect(basicInfo.province).toBe(doc.province);
  expect(basicInfo.zipCode).toBe(doc.zipCode);
  expect(basicInfo.country).toBe(doc.country);
  expect(basicInfo.registeredInCountry).toBe(doc.registeredInCountry);
  expect(basicInfo.registeredInAimag).toBe(doc.registeredInAimag);
  expect(basicInfo.registeredInSum).toBe(doc.registeredInSum);
  expect(basicInfo.isChinese).toBe(doc.isChinese);
  expect(basicInfo.isSubContractor).toBe(doc.isSubContractor);
  expect(basicInfo.corporateStructure).toBe(doc.corporateStructure);
  expect(basicInfo.registrationNumber).toBe(doc.registrationNumber);
  expect(basicInfo.email).toBe(doc.email);
  expect(basicInfo.website).toBe(doc.website);
  expect(basicInfo.foreignOwnershipPercentage).toBe(doc.foreignOwnershipPercentage);
  expect(basicInfo.totalNumberOfEmployees).toBe(doc.totalNumberOfEmployees);
  expect(basicInfo.totalNumberOfMongolianEmployees).toBe(doc.totalNumberOfMongolianEmployees);
  expect(basicInfo.totalNumberOfUmnugoviEmployees).toBe(doc.totalNumberOfUmnugoviEmployees);
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

  test('Create company: validations', async () => {
    expect.assertions(2);

    // duplicate english company name
    try {
      await Companies.createCompany({ enName: _company.enName });
    } catch (e) {
      expect(e.message).toBe('Duplicated english name');
    }

    // duplicate mongolian company name
    try {
      await Companies.createCompany({ enName: 'enName', mnName: _company.mnName });
    } catch (e) {
      expect(e.message).toBe('Duplicated mongolian name');
    }
  });

  test('Create company: valid', async () => {
    const doc = {
      enName: 'enName',
      mnName: 'mnName',
      sapNumber: 'sapNumber',
      isRegisteredOnSup: true,
      address: 'Address',
      address2: 'Address2',
      address3: 'Address3',
      townOrCity: 'Ulaanbaatar',
      province: 'Ulaanbaatar',
      zipCode: 976,
      country: 'Mongolia',
      registeredInCountry: 'Mongolia',
      registeredInAimag: 'Umnugiv',
      registeredInSum: 'Bayntsagaan',
      isChinese: false,
      isSubContractor: true,
      corporateStructure: 'Partnership',
      registrationNumber: 334839483943,
      email: 'company@gmail.com',
      website: 'web.com',
      foreignOwnershipPercentage: '40',
      totalNumberOfEmployees: 100,
      totalNumberOfMongolianEmployees: 80,
      totalNumberOfUmnugoviEmployees: 10,
    };

    const company = await Companies.createCompany(doc);

    checkBasicInfo(company.basicInfo, doc);
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
      email: 'companyUpdated@gmail.com',
      website: 'web.com',
      foreignOwnershipPercentage: '41',
      totalNumberOfEmployees: 101,
      totalNumberOfMongolianEmployees: 81,
      totalNumberOfUmnugoviEmployees: 11,
    };

    const updatedCompany = await Companies.updateBasicInfo(company._id, doc);

    checkBasicInfo(updatedCompany.basicInfo, doc);
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

    const updatedCompany = await Companies.updateContactInfo(company._id, doc);
    const contactInfo = updatedCompany.contactInfo;

    expect(contactInfo.name).toBe(doc.name);
    expect(contactInfo.address).toBe(doc.address);
    expect(contactInfo.address2).toBe(doc.address2);
    expect(contactInfo.townOrCity).toBe(doc.townOrCity);
    expect(contactInfo.province).toBe(doc.province);
    expect(contactInfo.zipCode).toBe(doc.zipCode);
    expect(contactInfo.country).toBe(doc.country);
    expect(contactInfo.email).toBe(doc.email);
    expect(contactInfo.phone).toBe(doc.phone);
    expect(contactInfo.phone2).toBe(doc.phone2);
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

    const updatedCompany = await Companies.updateManagementTeam(company._id, doc);
    const managementTeam = updatedCompany.managementTeam;

    expect(managementTeam.managingDirector.toJSON()).toEqual(doc.managingDirector);
    expect(managementTeam.executiveOfficer.toJSON()).toEqual(doc.executiveOfficer);
    expect(managementTeam.salesDirector.toJSON()).toEqual(doc.salesDirector);
    expect(managementTeam.financialDirector.toJSON()).toEqual(doc.financialDirector);
    expect(managementTeam.otherMember1.toJSON()).toEqual(doc.otherMember1);
    expect(managementTeam.otherMember2.toJSON()).toEqual(doc.otherMember2);
    expect(managementTeam.otherMember3.toJSON()).toEqual(doc.otherMember3);
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
      attachments: ['/path1'],
      shareholder1: generateShareholderDoc(),
      shareholder2: generateShareholderDoc(),
      shareholder3: generateShareholderDoc(),
      shareholder4: generateShareholderDoc(),
      shareholder5: generateShareholderDoc(),
    };

    const updatedCompany = await Companies.updateShareholderInfo(company._id, doc);
    const shareholderInfo = updatedCompany.shareholderInfo;

    expect(shareholderInfo.attachments).toContain('/path1');
    expect(shareholderInfo.shareholder1.toJSON()).toEqual(doc.shareholder1);
    expect(shareholderInfo.shareholder2.toJSON()).toEqual(doc.shareholder2);
    expect(shareholderInfo.shareholder3.toJSON()).toEqual(doc.shareholder3);
    expect(shareholderInfo.shareholder4.toJSON()).toEqual(doc.shareholder4);
    expect(shareholderInfo.shareholder5.toJSON()).toEqual(doc.shareholder5);
  });

  test('Update group info', async () => {
    const company = await companyFactory();

    const generateShareholderDoc = () => {
      return {
        name: `${Math.random()}name`,
        jobTitle: `${Math.random()}jobTitle`,
        percentage: Math.random(),
      };
    };

    const doc = {
      hasParent: true,
      role: 'manufacturer',
      isExclusiveDistributor: false,
      attachments: ['/path1'],
      primaryManufacturerName: 'primaryManufacturerName',
      countryOfPrimaryManufacturer: 'countryOfPrimaryManufacturer',
      shareholders: [generateShareholderDoc()],
    };

    const updatedCompany = await Companies.updateGroupInfo(company._id, doc);
    const groupInfo = updatedCompany.groupInfo;

    expect(groupInfo.attachments).toContain('/path1');
    expect(groupInfo.hasParent).toBe(doc.hasParent);
    expect(groupInfo.role).toBe(doc.role);
    expect(groupInfo.isExclusiveDistributor).toBe(doc.isExclusiveDistributor);
    expect(groupInfo.primaryManufacturerName).toBe(doc.primaryManufacturerName);
    expect(groupInfo.countryOfPrimaryManufacturer).toBe(doc.countryOfPrimaryManufacturer);

    const [shareholder] = groupInfo.shareholders;

    expect(shareholder.toJSON()).toEqual(doc.shareholders[0]);
  });

  test('Update products info', async () => {
    const company = await companyFactory();

    const productCodes = ['a10', 'c12'];

    const updatedCompany = await Companies.updateProductsInfo(company._id, productCodes);
    const productsInfo = updatedCompany.productsInfo;

    expect(productsInfo).toContain(...productCodes);
  });

  test('Update certificate info', async () => {
    const company = await companyFactory();

    const doc = {
      isReceived: true,
      isOTSupplier: false,
      cwpo: 'CW49108',
    };

    const updatedCompany = await Companies.updateCertificateInfo(company._id, doc);
    const certificateInfo = updatedCompany.certificateInfo;

    expect(certificateInfo.isReceived).toBe(doc.isReceived);
    expect(certificateInfo.isOTSupplier).toBe(doc.isOTSupplier);
    expect(certificateInfo.cwpo).toBe(doc.cwpo);
  });
  test('Update Financial Info', async () => {
    const company = await companyFactory();

    const doc = {
      canProvideAccountsInfo: true,
      currency: 'Euro (EUR)',
      annualTurnover: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      preTaxProfit: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      totalAssets: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      totalCurrentAssets: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      totalShareholderEquity: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
      canProvideRecordsInfo: [
        { date: '2010/10/1', path: 'path1' },
        { date: '2008/10/05', path: 'path2' },
      ],
      isUpToDateSSP: true,
      isUpToDateCTP: true,
    };
    const updatedCompany = await Companies.updateFinancialInfo(company._id, doc);
    const financialInfo = updatedCompany.financialInfo;

    expect(financialInfo.canProvideAccountsInfo).toBe(doc.canProvideAccountsInfo);
    expect(financialInfo.currency).toBe(doc.currency);
    expect(financialInfo.isUpToDateSSP).toBe(doc.isUpToDateSSP);
    expect(financialInfo.isUpToDateCTP).toBe(doc.isUpToDateCTP);

    const [at1, at2] = financialInfo.annualTurnover;
    expect(at1.toJSON()).toEqual(doc.annualTurnover[0]);
    expect(at2.toJSON()).toEqual(doc.annualTurnover[1]);

    const [ptp1, ptp2] = financialInfo.preTaxProfit;
    expect(ptp1.toJSON()).toEqual(doc.preTaxProfit[0]);
    expect(ptp2.toJSON()).toEqual(doc.preTaxProfit[1]);

    const [ta1, ta2] = financialInfo.totalAssets;
    expect(ta1.toJSON()).toEqual(doc.totalAssets[0]);
    expect(ta2.toJSON()).toEqual(doc.totalAssets[1]);

    const [tca1, tca2] = financialInfo.totalCurrentAssets;
    expect(tca1.toJSON()).toEqual(doc.totalCurrentAssets[0]);
    expect(tca2.toJSON()).toEqual(doc.totalCurrentAssets[1]);

    const [tse1, tse2] = financialInfo.totalShareholderEquity;
    expect(tse1.toJSON()).toEqual(doc.totalShareholderEquity[0]);
    expect(tse2.toJSON()).toEqual(doc.totalShareholderEquity[1]);

    const [cpri1, cpri2] = financialInfo.canProvideRecordsInfo;
    expect(cpri1.toJSON()).toEqual(doc.canProvideRecordsInfo[0]);
    expect(cpri2.toJSON()).toEqual(doc.canProvideRecordsInfo[1]);
  });

  test('Update Business integrity and Human resource', async () => {
    const company = await companyFactory();

    const doc = {
      doesMeetMinimumStandarts: true,
      doesHaveJobDescription: true,
      doesConcludeValidContracts: true,
      employeeTurnoverRate: 12,
      doesHaveLiabilityInsurance: false,
      doesHaveCodeEthics: true,
      doesHaveResponsiblityPolicy: true,
      hasConvictedLabourLaws: true,
      hasConvictedForHumanRights: true,
      hasConvictedForBusinessIntegrity: false,
      proveHasNotConvicted: 'Lorem ipsum',
      hasLeadersConvicted: true,
      investigations: [
        { name: 'Name', date: '2010.01.01', status: 'Status', statusDate: '2011.01.01' },
      ],
      doesEmployeePoliticallyExposed: true,
      additionalInformation: 'Lorem ipsum',
    };

    const updatedCompany = await Companies.updateBusinessAndHumanResource(company._id, doc);
    const businessAndHumanResource = updatedCompany.businessAndHumanResource;

    expect(businessAndHumanResource.doesMeetMinimumStandarts).toBe(doc.doesMeetMinimumStandarts);
    expect(businessAndHumanResource.doesHaveJobDescription).toBe(doc.doesHaveJobDescription);
    expect(businessAndHumanResource.doesConcludeValidContracts).toBe(
      doc.doesConcludeValidContracts,
    );
    expect(businessAndHumanResource.employeeTurnoverRate).toBe(doc.employeeTurnoverRate);
    expect(businessAndHumanResource.doesHaveLiabilityInsurance).toBe(
      doc.doesHaveLiabilityInsurance,
    );
    expect(businessAndHumanResource.doesHaveCodeEthics).toBe(doc.doesHaveCodeEthics);
    expect(businessAndHumanResource.doesHaveResponsiblityPolicy).toBe(
      doc.doesHaveResponsiblityPolicy,
    );
    expect(businessAndHumanResource.hasConvictedLabourLaws).toBe(doc.hasConvictedLabourLaws);
    expect(businessAndHumanResource.hasConvictedForHumanRights).toBe(
      doc.hasConvictedForHumanRights,
    );
    expect(businessAndHumanResource.hasConvictedForBusinessIntegrity).toBe(
      doc.hasConvictedForBusinessIntegrity,
    );
    expect(businessAndHumanResource.proveHasNotConvicted).toBe(doc.proveHasNotConvicted);
    expect(businessAndHumanResource.hasLeadersConvicted).toBe(doc.hasLeadersConvicted);
    expect(businessAndHumanResource.doesEmployeePoliticallyExposed).toBe(
      doc.doesEmployeePoliticallyExposed,
    );
    expect(businessAndHumanResource.additionalInformation).toBe(doc.additionalInformation);

    const [i1] = businessAndHumanResource.investigations;
    expect(i1.toJSON()).toEqual(doc.investigations[0]);
  });
  test('Update environmental management', async () => {
    const company = await companyFactory();

    const doc = {
      doesHavePlan: true,
      hasEnvironmentalRegulatorInvestigated: true,
      dateOfInvestigation: '2010.01.01',
      reasonForInvestigation: 'Lorem ipsum',
      actionStatus: 'In Progress',
      investigationDocumentation: 'path1',
      hasConvictedForEnvironmentalLaws: true,
      proveHasNotConvicted: 'Lorem ipsum',
      additionalInformation: 'Lorem ipsum',
    };

    const updatedCompany = await Companies.updateEnvironmentalManagement(company._id, doc);
    const environmentalManagement = updatedCompany.environmentalManagement;

    expect(environmentalManagement.doesHavePlan).toBe(doc.doesHavePlan);
    expect(environmentalManagement.hasEnvironmentalRegulatorInvestigated).toBe(
      doc.hasEnvironmentalRegulatorInvestigated,
    );
    expect(environmentalManagement.dateOfInvestigation).toBe(doc.dateOfInvestigation);
    expect(environmentalManagement.reasonForInvestigation).toBe(doc.reasonForInvestigation);
    expect(environmentalManagement.actionStatus).toBe(doc.actionStatus);
    expect(environmentalManagement.investigationDocumentation).toBe(doc.investigationDocumentation);
    expect(environmentalManagement.hasConvictedForEnvironmentalLaws).toBe(
      doc.hasConvictedForEnvironmentalLaws,
    );
    expect(environmentalManagement.proveHasNotConvicted).toBe(doc.proveHasNotConvicted);
    expect(environmentalManagement.additionalInformation).toBe(doc.additionalInformation);
  });

  test('Update health and safety management system', async () => {
    const company = await companyFactory();

    const doc = {
      doesHaveHealthSafety: true,
      areHSEResourcesClearlyIdentified: true,
      doesHaveDocumentedProcessToEnsure: true,
      areEmployeesUnderYourControl: true,
      doesHaveDocumentForRiskAssesment: true,
      doesHaveDocumentForIncidentInvestigation: false,
      doesHaveDocumentedFitness: false,
      isWillingToComply: true,
    };

    const updatedCompany = await Companies.updateHealthAndSafetyManagement(company._id, doc);
    const healthAndSafetyManagement = updatedCompany.healthAndSafetyManagement;

    expect(healthAndSafetyManagement.doesHaveHealthSafety).toBe(doc.doesHaveHealthSafety);
    expect(healthAndSafetyManagement.areHSEResourcesClearlyIdentified).toBe(
      doc.areHSEResourcesClearlyIdentified,
    );
    expect(healthAndSafetyManagement.doesHaveDocumentedProcessToEnsure).toBe(
      doc.doesHaveDocumentedProcessToEnsure,
    );
    expect(healthAndSafetyManagement.areEmployeesUnderYourControl).toBe(
      doc.areEmployeesUnderYourControl,
    );
    expect(healthAndSafetyManagement.doesHaveDocumentForRiskAssesment).toBe(
      doc.doesHaveDocumentForRiskAssesment,
    );
    expect(healthAndSafetyManagement.doesHaveDocumentForIncidentInvestigation).toBe(
      doc.doesHaveDocumentForIncidentInvestigation,
    );
    expect(healthAndSafetyManagement.doesHaveDocumentedFitness).toBe(doc.doesHaveDocumentedFitness);
    expect(healthAndSafetyManagement.isWillingToComply).toBe(doc.isWillingToComply);
  });
});
