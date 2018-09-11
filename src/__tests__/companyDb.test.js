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
  });

  test('send prequalification info', async () => {
    const company = await Companies.findOne({ _id: _company._id });

    await company.sendPrequalificationInfo();

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isSentPrequalificationInfo).toBe(true);
    expect(updatedCompany.isPrequalificationInfoEditable).toBe(false);
  });

  test('skip prequalification', async () => {
    const company = await Companies.findOne({ _id: _company._id });

    await company.skipPrequalification('reason');

    const updatedCompany = await Companies.findOne({ _id: _company._id });

    expect(updatedCompany.isSkippedPrequalification).toBe(true);
    expect(updatedCompany.prequalificationSkippedReason).toBe('reason');
  });
});
