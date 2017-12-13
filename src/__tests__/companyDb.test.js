/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';
import { companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Companies model tests', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
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

    const basicInfo = updatedCompany.basicInfo;

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
    expect(basicInfo.certificateOfRegistration.toJSON()).toEqual(doc.certificateOfRegistration);
    expect(basicInfo.email).toBe(doc.email);
    expect(basicInfo.website).toBe(doc.website);
    expect(basicInfo.foreignOwnershipPercentage).toBe(doc.foreignOwnershipPercentage);
    expect(basicInfo.totalNumberOfEmployees).toBe(doc.totalNumberOfEmployees);
    expect(basicInfo.totalNumberOfMongolianEmployees).toBe(doc.totalNumberOfMongolianEmployees);
    expect(basicInfo.totalNumberOfUmnugoviEmployees).toBe(doc.totalNumberOfUmnugoviEmployees);
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

    const updatedCompany = await Companies.updateSection(company._id, 'managementTeamInfo', doc);
    const managementTeam = updatedCompany.managementTeamInfo;

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
      attachments: [{name: 'name', url: '/path1'}],
      shareholders: [generateShareholderDoc(), generateShareholderDoc()],
    };

    const updatedCompany = await Companies.updateSection(company._id, 'shareholderInfo', doc);
    const [sh1, sh2] = updatedCompany.shareholderInfo.shareholders;

    expect(updatedCompany.shareholderInfo.attachments[0].toJSON()).toEqual(doc.attachments[0]);
    expect(sh1.toJSON()).toEqual(doc.shareholders[0]);
    expect(sh2.toJSON()).toEqual(doc.shareholders[1]);
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
      parentAddress: 'parentAddress',
      parentRegistrationNumber: 'parentRegistrationNumber',
      role: 'manufacturer',
      isExclusiveDistributor: false,
      attachments: [{ name: 'name', url: '/path1' }],
      primaryManufacturerName: 'primaryManufacturerName',
      countryOfPrimaryManufacturer: 'countryOfPrimaryManufacturer',
      factories: [generateFactoryDoc()],
    };

    const updatedCompany = await Companies.updateSection(company._id, 'groupInfo', doc);
    const groupInfo = updatedCompany.groupInfo;

    expect(groupInfo.attachments[0].toJSON()).toEqual(doc.attachments[0]);
    expect(groupInfo.hasParent).toBe(doc.hasParent);
    expect(groupInfo.parentAddress).toBe(doc.parentAddress);
    expect(groupInfo.parentRegistrationNumber).toBe(doc.parentRegistrationNumber);
    expect(groupInfo.role).toBe(doc.role);
    expect(groupInfo.isExclusiveDistributor).toBe(doc.isExclusiveDistributor);
    expect(groupInfo.primaryManufacturerName).toBe(doc.primaryManufacturerName);
    expect(groupInfo.countryOfPrimaryManufacturer).toBe(doc.countryOfPrimaryManufacturer);

    const [factory] = groupInfo.factories;
    expect(factory.toJSON()).toEqual(doc.factories[0]);
  });

  test('Update products info', async () => {
    const company = await companyFactory();

    const productCodes = ['a10', 'c12'];

    const updatedCompany = await Companies.updateSection(company._id, 'productsInfo', productCodes);
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

    const updatedCompany = await Companies.updateSection(company._id, 'certificateInfo', doc);
    const certificateInfo = updatedCompany.certificateInfo;

    expect(certificateInfo.isReceived).toBe(doc.isReceived);
    expect(certificateInfo.isOTSupplier).toBe(doc.isOTSupplier);
    expect(certificateInfo.cwpo).toBe(doc.cwpo);
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
    const financialInfo = updatedCompany.financialInfo;

    expect(financialInfo.canProvideAccountsInfo).toBe(doc.canProvideAccountsInfo);
    expect(financialInfo.reasonToCannotNotProvide).toBe(doc.reasonToCannotNotProvide);
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

    const [cpri1, cpri2] = financialInfo.recordsInfo;
    expect(cpri1.toJSON()).toEqual(doc.recordsInfo[0]);
    expect(cpri2.toJSON()).toEqual(doc.recordsInfo[1]);
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

    const updatedCompany = await Companies.updateSection(company._id, 'businessInfo', doc);
    const businessAndHumanResource = updatedCompany.businessInfo;

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
      investigationDocumentation: {name: 'name', url: 'path1'},
      hasConvictedForEnvironmentalLaws: true,
      proveHasNotConvicted: 'Lorem ipsum',
      additionalInformation: 'Lorem ipsum',
    };

    const updatedCompany = await Companies.updateSection(company._id, 'environmentalInfo', doc);
    const environmentalManagement = updatedCompany.environmentalInfo;

    expect(environmentalManagement.doesHavePlan).toBe(doc.doesHavePlan);
    expect(environmentalManagement.hasEnvironmentalRegulatorInvestigated).toBe(
      doc.hasEnvironmentalRegulatorInvestigated,
    );
    expect(environmentalManagement.dateOfInvestigation).toBe(doc.dateOfInvestigation);
    expect(environmentalManagement.reasonForInvestigation).toBe(doc.reasonForInvestigation);
    expect(environmentalManagement.actionStatus).toBe(doc.actionStatus);
    expect(environmentalManagement.investigationDocumentation.toJSON()).toEqual(
      doc.investigationDocumentation
    );
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
    const health = updatedCompany.healthInfo;

    expect(health.doesHaveHealthSafety).toBe(doc.doesHaveHealthSafety);
    expect(health.areHSEResourcesClearlyIdentified).toBe(
      doc.areHSEResourcesClearlyIdentified,
    );
    expect(health.doesHaveDocumentedProcessToEnsure).toBe(
      doc.doesHaveDocumentedProcessToEnsure,
    );
    expect(health.areEmployeesUnderYourControl).toBe(
      doc.areEmployeesUnderYourControl,
    );
    expect(health.doesHaveDocumentForRiskAssesment).toBe(
      doc.doesHaveDocumentForRiskAssesment,
    );
    expect(health.doesHaveDocumentForIncidentInvestigation).toBe(
      doc.doesHaveDocumentForIncidentInvestigation,
    );
    expect(health.isWillingToComply).toBe(doc.isWillingToComply);
    expect(health.doesHaveDocumentedFitness).toBe(doc.doesHaveDocumentedFitness);
    expect(health.hasIndustrialAccident).toBe(doc.hasIndustrialAccident);
    expect(health.tmha).toBe(doc.tmha);
    expect(health.ltifr).toBe(doc.ltifr);
    expect(health.injuryExplanation).toBe(doc.injuryExplanation);
    expect(health.seniorManagement).toBe(doc.seniorManagement);
    expect(health.isWillingToCommit).toBe(doc.isWillingToCommit);
    expect(health.isPerparedToCompile).toBe(doc.isPerparedToCompile);
    expect(health.hasWorkedOnWorldBank).toBe(doc.hasWorkedOnWorldBank);
    expect(health.hasWorkedOnWorldBankDescription).toBe(doc.hasWorkedOnWorldBankDescription);
    expect(health.hasWorkedOnLargeProjects).toBe(doc.hasWorkedOnLargeProjects);
    expect(health.hasWorkedOnLargeProjectsDescription).toBe(doc.hasWorkedOnLargeProjectsDescription);
    expect(health.doesHaveLicense).toBe(doc.doesHaveLicense);
    expect(health.doesHaveLicenseDescription).toBe(doc.doesHaveLicenseDescription);
  });
});
