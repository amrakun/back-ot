/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Companies } from '../db/models';
import { userFactory, companyFactory, companyDocs } from '../db/factories';

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

  const toObject = data => {
    return JSON.parse(JSON.stringify(data));
  };

  const checkSection = async name => {
    const company = await companyFactory({ isProductsInfoValidated: true });

    const doc = companyDocs[name]();
    const updatedCompany = await Companies.updateSection(company._id, `${name}Info`, doc);

    expect(toObject(updatedCompany[`${name}Info`])).toEqual(doc);

    return updatedCompany;
  };

  test('Create', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id);

    expect(company).toBeDefined();
    expect(company._id).toBeDefined();
    expect(company.isSentRegistrationInfo).toBe(false);
    expect(company.isSentPrequalificationInfo).toBe(false);

    const [difotScore] = company.difotScores;

    expect(difotScore.date).toBeDefined();
    expect(difotScore.amount).toBe(75);

    const updatedUser = await Users.findOne({ _id: user._id });

    expect(updatedUser.companyId).toBe(company._id.toString());
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

  test('Update basic Info: vendorNumber reset to null', async () => {
    const company = await companyFactory();

    const doc = companyDocs['basic']();

    // is existing supplier true
    doc.isRegisteredOnSup = true;
    doc.sapNumber = '1';

    let updatedCompany = await Companies.updateSection(company._id, 'basicInfo', doc);

    let basicInfo = updatedCompany.basicInfo;

    expect(basicInfo.isRegisteredOnSup).toBe(true);
    expect(basicInfo.sapNumber).toBe('1');

    // is existing supplier false
    doc.isRegisteredOnSup = false;

    updatedCompany = await Companies.updateSection(company._id, 'basicInfo', doc);
    basicInfo = updatedCompany.basicInfo;

    expect(basicInfo.isRegisteredOnSup).toBe(false);
    expect(basicInfo.sapNumber).toBe(undefined);
  });

  test('Update basic info: valid', async () => {
    await checkSection('basic');
  });

  test('Update contact info', async () => {
    await checkSection('contact');
  });

  test('Update management team', async () => {
    await checkSection('managementTeam');
  });

  test('Update shareholder info', async () => {
    await checkSection('shareholder');
  });

  test('Update group info', async () => {
    await checkSection('group');
  });

  test('Update products info', async () => {
    const updatedCompany = await checkSection('products');

    expect(updatedCompany.isProductsInfoValidated).toBe(false);
  });

  test('Update certificate info', async () => {
    await checkSection('certificate');
  });

  test('Update Financial Info', async () => {
    await checkSection('financial');
  });

  // Can you provide accounts for the last 3 financial years'
  test('Update Financial Info: check last 3 financial years', async () => {
    const company = await companyFactory({});

    // canProvideAccountsInfo true =======
    const doc = companyDocs['financial']();

    let updatedCompany = await Companies.updateSection(company._id, 'financialInfo', doc);
    let financialInfo = updatedCompany.financialInfo;

    expect(financialInfo.canProvideAccountsInfo).toBe(true);
    expect(financialInfo.reasonToCannotNotProvide).toBeUndefined();
    expect(financialInfo.currency).toBeDefined();
    expect(financialInfo.annualTurnover).toBeDefined();
    expect(financialInfo.preTaxProfit).toBeDefined();
    expect(financialInfo.totalAssets).toBeDefined();
    expect(financialInfo.totalCurrentAssets).toBeDefined();
    expect(financialInfo.totalShareholderEquity).toBeDefined();
    expect(financialInfo.recordsInfo).toBeDefined();

    // canProvideAccountsInfo false =======
    doc.canProvideAccountsInfo = false;

    updatedCompany = await Companies.updateSection(company._id, 'financialInfo', doc);
    financialInfo = updatedCompany.financialInfo;

    expect(financialInfo.canProvideAccountsInfo).toBe(false);
    expect(financialInfo.currency).toBeUndefined();
    expect(financialInfo.annualTurnover.length).toBe(0);
    expect(financialInfo.preTaxProfit.length).toBe(0);
    expect(financialInfo.totalAssets.length).toBe(0);
    expect(financialInfo.totalCurrentAssets.length).toBe(0);
    expect(financialInfo.totalShareholderEquity.length).toBe(0);
    expect(financialInfo.recordsInfo.length).toBe(0);
  });

  // Has any environmental regulator inspected / investigated your
  // company within the last 5 years?
  test('Update Environmental management: has investigated', async () => {
    const company = await companyFactory({});

    // hasEnvironmentalRegulatorInvestigated true =======
    const doc = companyDocs['environmental']();

    let updatedCompany = await Companies.updateSection(company._id, 'environmentalInfo', doc);
    let environmentalInfo = updatedCompany.environmentalInfo;

    expect(environmentalInfo.hasEnvironmentalRegulatorInvestigated).toBe(true);
    expect(environmentalInfo.dateOfInvestigation).toBeDefined();
    expect(environmentalInfo.reasonForInvestigation).toBeDefined();
    expect(environmentalInfo.actionStatus).toBeDefined();
    expect(environmentalInfo.investigationDocumentation).toBeDefined();

    // hasEnvironmentalRegulatorInvestigated false =======
    doc.hasEnvironmentalRegulatorInvestigated = false;

    updatedCompany = await Companies.updateSection(company._id, 'environmentalInfo', doc);
    environmentalInfo = updatedCompany.environmentalInfo;

    expect(environmentalInfo.hasEnvironmentalRegulatorInvestigated).toBe(false);
    expect(environmentalInfo.dateOfInvestigation).toBeUndefined();
    expect(environmentalInfo.reasonForInvestigation).toBeUndefined();
    expect(environmentalInfo.actionStatus).toBeUndefined();
    expect(environmentalInfo.investigationDocumentation).toBeUndefined();
  });

  test('Check file field is being reseted to null', async () => {
    const company = await companyFactory({});

    const doc = companyDocs['business']();

    let updatedCompany = await Companies.updateSection(company._id, 'businessInfo', doc);
    let businessInfo = updatedCompany.businessInfo;

    expect(businessInfo.doesHaveJobDescription).toBe(true);
    expect(businessInfo.doesHaveJobDescriptionFile).toBeDefined();
    expect(businessInfo.doesHaveLiabilityInsurance).toBe(true);
    expect(businessInfo.doesHaveLiabilityInsuranceFile).toBeDefined();

    // setting to false =======
    doc.doesHaveJobDescription = false;
    doc.doesHaveLiabilityInsurance = false;

    updatedCompany = await Companies.updateSection(company._id, 'businessInfo', doc);
    businessInfo = updatedCompany.businessInfo;

    expect(businessInfo.doesHaveJobDescription).toBe(false);
    expect(businessInfo.doesHaveJobDescriptionFile).toBeUndefined();
    expect(businessInfo.doesHaveLiabilityInsurance).toBe(false);
    expect(businessInfo.doesHaveLiabilityInsuranceFile).toBeUndefined();
  });

  test('Create', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id);

    expect(company).toBeDefined();
    expect(company._id).toBeDefined();
    expect(company.isSentRegistrationInfo).toBe(false);
    expect(company.isSentPrequalificationInfo).toBe(false);

    const [difotScore] = company.difotScores;

    expect(difotScore.date).toBeDefined();
    expect(difotScore.amount).toBe(75);

    const updatedUser = await Users.findOne({ _id: user._id });

    expect(updatedUser.companyId).toBe(company._id.toString());
  });

  test('Update Business integrity and Human resource', async () => {
    await checkSection('business');
  });

  test('Update environmental management', async () => {
    await checkSection('environmental');
  });

  test('Update health and safety management system', async () => {
    await checkSection('health');
  });

  test('Prequalication changes disabled', async () => {
    expect.assertions(4);

    const company = await companyFactory({ isPrequalificationInfoEditable: false });

    const checkException = async name => {
      try {
        await Companies.updateSection(company._id, `${name}Info`, companyDocs[name]());
      } catch (e) {
        expect(e.message).toBe('Changes disabled');
      }
    };

    await checkException('financial');
    await checkException('business');
    await checkException('environmental');
    await checkException('health');
  });

  test('Add difot score', async () => {
    const company = await Companies.findOne({ _id: _company._id });
    const date = new Date();

    let updatedCompany = await company.addDifotScore(date, 10);
    updatedCompany = await company.addDifotScore(date, 11);

    expect(updatedCompany.averageDifotScore).toBe(10.5);
    expect(updatedCompany.difotScores.length).toBe(2);

    const [score1, score2] = updatedCompany.difotScores;

    expect(new Date(score1.date)).toEqual(date);
    expect(score1.amount).toBe(10);

    expect(new Date(score2.date)).toEqual(date);
    expect(score2.amount).toBe(11);
  });

  test('Add due dilingence', async () => {
    const user = await userFactory({});
    const company = await Companies.findOne({ _id: _company._id });

    let updatedCompany = await company.addDueDiligence(
      { file: { url: '/path1' }, expireDate: new Date() },
      user,
    );

    updatedCompany = await company.addDueDiligence(
      { file: { url: '/path2' }, expireDate: new Date() },
      user,
    );

    expect(updatedCompany.dueDiligences.length).toBe(2);

    const [diligence1, diligence2] = updatedCompany.dueDiligences;

    expect(diligence1.date).toBeDefined();
    expect(diligence1.expireDate).toBeDefined();
    expect(diligence1.file.url).toBe('/path1');
    expect(diligence1.createdUserId).toBeDefined();

    expect(diligence2.date).toBeDefined();
    expect(diligence2.expireDate).toBeDefined();
    expect(diligence2.file.url).toBe('/path2');
    expect(diligence2.createdUserId).toBeDefined();
  });

  test('Validate product info', async () => {
    let company = await companyFactory({ productsInfo: ['code1', 'code2', 'code3'] });
    company = await Companies.findOne({ _id: company._id });

    // checking isProductsInfoValidated
    let updatedCompany = await company.validateProductsInfo({ checkedItems: [] });
    expect(updatedCompany.isProductsInfoValidated).toBe(false);
    expect(updatedCompany.productsInfoValidations.length).toBe(0);

    updatedCompany = await company.validateProductsInfo({
      checkedItems: ['code1', 'code2', 'code3'],
      personName: 'test',
      justification: 'justification',
    });

    expect(updatedCompany.isProductsInfoValidated).toBe(true);
    expect(updatedCompany.validatedProductsInfo).toContain('code1');
    expect(updatedCompany.validatedProductsInfo).toContain('code2');
    expect(updatedCompany.validatedProductsInfo).toContain('code3');

    let [info] = updatedCompany.productsInfoValidations;

    expect(info.date).toBeDefined();
    expect(info.personName).toBe('test');
    expect(info.justification).toBe('justification');
    expect(info.checkedItems).toContain('code1');
    expect(info.checkedItems).toContain('code2');
    expect(info.checkedItems).toContain('code3');

    // try to add non existing code ==========
    updatedCompany = await updatedCompany.validateProductsInfo({
      checkedItems: ['code10'],
    });

    [info] = updatedCompany.productsInfoValidations;

    expect(info.checkedItems).not.toContain('code10');
  });

  test('send registration info', async () => {
    const company = await Companies.findOne({ _id: _company._id });

    await company.sendRegistrationInfo();

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isSentRegistrationInfo).toBe(true);
    expect(updatedCompany.registrationInfoSentDate).toBeDefined();
  });

  test('send prequalification info', async () => {
    const company = await Companies.findOne({ _id: _company._id });

    await company.sendPrequalificationInfo();

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isSentPrequalificationInfo).toBe(true);
    expect(updatedCompany.isPrequalificationInfoEditable).toBe(false);
    expect(updatedCompany.prequalificationInfoSentDate).toBeDefined();
  });

  test('skip prequalification', async () => {
    const company = await Companies.findOne({ _id: _company._id });

    await company.skipPrequalification('reason');

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isSkippedPrequalification).toBe(true);
    expect(updatedCompany.prequalificationSkippedReason).toBe('reason');
  });

  test('Check file permission', async () => {
    const company = await companyFactory({
      certificateOfRegistration: { name: 'name.png', url: '/url' },
      shareholderInfo: {
        attachments: [
          { name: 'sh_attach10.png', url: '/attach10' },
          { name: 'sh_attach2.png', url: '/attach2' },
          { name: 'sh_attach4.png', url: '/attach4' },
        ],
        shareholders: [],
      },
      groupInfo: {
        role: 'manufacturer',
        attachments: [
          { name: 'gr_attach10.png', url: '/attach10' },
          { name: 'gr_attach2.png', url: '/attach2' },
          { name: 'gr_attach4.png', url: '/attach4' },
        ],
      },
      certificateInfo: {
        description: 'description',
        file: { name: 'cer_attach.png', url: '/cer_attach' },
      },
      financialInfo: {
        isUpToDateCTP: false,
        canProvideAccountsInfo: false,

        recordsInfo: [
          {
            date: new Date(),
            file: { name: 'fin_attach1.png', url: '/fin_attach1' },
          },
          {
            date: new Date(),
            file: { name: 'fin_attach2.png', url: '/fin_attach2' },
          },
        ],
      },
      businessInfo: {
        ...companyDocs.business(),
        doesMeetMinimumStandartsFile: { name: 'busi1.png', url: '/busi1' },
        doesHaveJobDescriptionFile: { name: 'busi2.png', url: '/busi2' },
        doesHaveLiabilityInsuranceFile: { name: 'busi3.png', url: '/busi3' },
        doesHaveCodeEthicsFile: { name: 'busi4.png', url: '/busi4' },
        doesHaveResponsiblityPolicyFile: { name: 'busi5.png', url: '/busi5' },
        organizationChartFile: { name: 'busi6.png', url: '/busi6' },
      },
      environmentalInfo: {
        ...companyDocs.environmental(),
        doesHavePlanFile: { name: 'env1.png', url: '/env1' },
        investigationDocumentation: { name: 'env2.png', url: '/env2' },
      },
      healthInfo: {
        ...companyDocs.health(),
        doesHaveHealthSafetyFile: { name: 'health1.png', url: '/health1' },
        areHSEResourcesClearlyIdentifiedFile: { name: 'health2.png', url: '/health2' },
        doesHaveDocumentedProcessToEnsureFile: { name: 'health3.png', url: '/health3' },
        areEmployeesUnderYourControlFile: { name: 'health4.png', url: '/health4' },
        doesHaveDocumentForRiskAssesmentFile: { name: 'health5.png', url: '/health5' },
        doesHaveDocumentForIncidentInvestigationFile: { name: 'health6.png', url: '/health6' },
        doesHaveDocumentedFitnessFile: { name: 'health7.png', url: '/health87' },
      },
    });

    const user = await userFactory({ isSupplier: true, companyId: company._id });
    const buyer = await userFactory({});

    // buyer can download all files
    expect(await Companies.isAuthorizedToDownload('test.png', buyer)).toBe(true);

    // certificate of registration
    expect(await Companies.isAuthorizedToDownload('test.png', user)).toBe(false);
    expect(await Companies.isAuthorizedToDownload('name.png', user)).toBe(true);

    // shareholders
    expect(await Companies.isAuthorizedToDownload('sh_attach2.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('sh_attach10.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('sh_attach3.png', user)).toBe(false);

    // group info
    expect(await Companies.isAuthorizedToDownload('gr_attach2.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('gr_attach10.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('gr_attach3.png', user)).toBe(false);

    // certificate info
    expect(await Companies.isAuthorizedToDownload('cer_attach.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('cer_attach1.png', user)).toBe(false);

    // financialInfo info
    expect(await Companies.isAuthorizedToDownload('fin_attach1.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('fin_attach3.png', user)).toBe(false);

    // businessInfo info
    expect(await Companies.isAuthorizedToDownload('busi1.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('busi2.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('busi3.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('busi4.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('busi5.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('busi6.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('busi7.png', user)).toBe(false);

    // environmental info
    expect(await Companies.isAuthorizedToDownload('env1.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('env2.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('env3.png', user)).toBe(false);

    // health info
    expect(await Companies.isAuthorizedToDownload('health1.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health2.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health3.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health4.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health5.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health6.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health7.png', user)).toBe(true);
    expect(await Companies.isAuthorizedToDownload('health8.png', user)).toBe(false);
  });
});
