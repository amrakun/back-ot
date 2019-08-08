/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, Qualifications, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory, auditFactory, qualificationFactory } from '../db/factories';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from '../db/models/Companies';

import queries from '../data/resolvers/queries/companies';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  const commonParams = `
    $search: String,
    $region: String,
    $productCodes: String,
    $includeBlocked: Boolean,
    $productsInfoStatus: String,
    $prequalifiedStatus: String,
    $qualifiedStatus: String,
    $_ids: [String],
    $perPage: Int,
    $page: Int,
  `;

  const commonValues = `
    search: $search,
    region: $region,
    productCodes: $productCodes,
    includeBlocked: $includeBlocked,
    productsInfoStatus: $productsInfoStatus,
    prequalifiedStatus: $prequalifiedStatus,
    qualifiedStatus: $qualifiedStatus,
    _ids: $_ids,
    perPage: $perPage,
    page: $page,
  `;

  const query = `
    query companies(${commonParams}) {
      companies(${commonValues}) {
        _id
        basicInfo {
          mnName
          enName
          sapNumber
        }

        productsInfo
        validatedProductsInfo
        isProductsInfoValidated

        isSentRegistrationInfo
        isSentPrequalificationInfo

        isPrequalified
        prequalifiedDate
        isQualified

        averageDifotScore

        productsInfoValidations {
          date
          files
          checkedItems
          justification
          personName
        }

        dueDiligences {
          date
          expireDate
          file
          createdUserId

          createdUser {
            _id
          }
        }

        difotScores {
          date
          amount
        }

        audits {
          _id
        }
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Qualifications.remove({});
  });

  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(7);

    const user = await userFactory({ isSupplier: true });

    const items = [
      'companies',
      'companyDetail',
      'companiesTotalCount',
      'companiesExport',
      'companyRegistrationExport',
      'companiesValidatedProductsInfoExport',
      'companiesPrequalifiedStatus',
    ];

    for (let query of items) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('Supplier required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(3);

    const user = await userFactory({ isSupplier: false });

    const items = [
      'companyByUser',
      'companyRegistrationSupplierExport',
      'companyPrequalificationSupplierExport',
    ];

    for (let query of items) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('companies', async () => {
    const user = await userFactory();

    // Creating test data ==============
    await Companies.createCompany(user._id); // to check empty company ignorance

    const company1 = await companyFactory({
      mnName: 'mn name',
      productsInfo: ['code1', 'code2'],
      isProductsInfoValidated: true,
    });

    // block this supplier
    const oneDayAgo = moment()
      .subtract(1, 'day')
      .endOf('day');
    const tomorrow = moment()
      .add(1, 'day')
      .endOf('day');

    const blockedCompany = await companyFactory({ enName: 'blocked' });

    await BlockedCompanies.block(
      {
        supplierId: blockedCompany._id,
        groupId: 'DFFDSASD',
        startDate: oneDayAgo,
        endDate: tomorrow,
      },
      user._id,
    );

    await companyFactory({ enName: 'en name', sapNumber: '1441aabb' });

    // When there is no filter, it must return all companies =============
    let response = await graphqlRequest(query, 'companies');

    expect(response.length).toBe(2);

    // filter by name =============
    response = await graphqlRequest(query, 'companies', { search: 'mn name' });

    expect(response.length).toBe(1);
    expect(response[0].basicInfo.mnName).toBe('mn name');

    response = await graphqlRequest(query, 'companies', { search: 'en name' });

    expect(response.length).toBe(1);
    expect(response[0].basicInfo.enName).toBe('en name');

    // filter by sapNumber =============
    response = await graphqlRequest(query, 'companies', { search: 'mn name' });

    expect(response.length).toBe(1);
    expect(response[0].basicInfo.mnName).toBe('mn name');

    response = await graphqlRequest(query, 'companies', { search: '1441aabb' });

    expect(response.length).toBe(1);
    expect(response[0].basicInfo.sapNumber).toBe('1441aabb');

    // filter by products & services =============
    // one value
    response = await graphqlRequest(query, 'companies', { productCodes: 'code1' });

    expect(response.length).toBe(1);
    expect(response[0].productsInfo).toContain('code1');

    // two values
    response = await graphqlRequest(query, 'companies', { productCodes: 'code1,code2' });

    expect(response.length).toBe(1);
    expect(response[0].productsInfo).toContain('code1');
    expect(response[0].productsInfo).toContain('code2');

    // no result
    response = await graphqlRequest(query, 'companies', { productCodes: 'code3' });

    expect(response.length).toBe(0);

    // filter by _ids =============
    response = await graphqlRequest(query, 'companies', { _ids: [company1._id] });

    expect(response.length).toBe(1);

    // filter isValidated =============
    response = await graphqlRequest(query, 'companies', { productsInfoStatus: 'yes' });

    expect(response.length).toBe(1);

    // blocked & pager =============
    response = await graphqlRequest(query, 'companies', {
      includeBlocked: false,
      perPage: 10,
      page: 1,
    });

    expect(response.length).toBe(2);
  });

  test('companies: difotScoreRange', async () => {
    const qry = `
      query companies($difotScore: String) {
        companies(difotScore: $difotScore) {
          averageDifotScore
        }
      }
    `;

    await companyFactory({ mnName: 'sup1', averageDifotScore: 2 });
    await companyFactory({ mnName: 'sup2', averageDifotScore: 27 });
    await companyFactory({ mnName: 'sup3', averageDifotScore: 52 });
    await companyFactory({ mnName: 'sup4', averageDifotScore: 77 });

    // 0-25
    let response = await graphqlRequest(qry, 'companies', { difotScore: '0-25' });
    expect(response.length).toBe(1);
    expect(response[0].averageDifotScore).toBe(2);

    // 26-50
    response = await graphqlRequest(qry, 'companies', { difotScore: '26-50' });
    expect(response.length).toBe(1);
    expect(response[0].averageDifotScore).toBe(27);

    // 51-74
    response = await graphqlRequest(qry, 'companies', { difotScore: '51-74' });
    expect(response.length).toBe(1);
    expect(response[0].averageDifotScore).toBe(52);

    // 75-100
    response = await graphqlRequest(qry, 'companies', { difotScore: '75-100' });
    expect(response.length).toBe(1);
    expect(response[0].averageDifotScore).toBe(77);
  });

  // test status typed filters
  const checkStatus = async ({ qry, fieldName, variableName }) => {
    await companyFactory({ [fieldName]: true });
    await companyFactory({ [fieldName]: false });
    await companyFactory({ [fieldName]: null });

    // yes ================
    let response = await graphqlRequest(qry, 'companies', { [variableName]: 'yes' });

    expect(response.length).toBe(1);
    expect(response[0][fieldName]).toBe(true);

    // no ================
    response = await graphqlRequest(qry, 'companies', { [variableName]: 'no' });

    expect(response.length).toBe(1);
    expect(response[0][fieldName]).toBe(false);

    // undefined ================
    response = await graphqlRequest(qry, 'companies', { [variableName]: 'undefined' });

    expect(response.length).toBe(1);
    expect(response[0][fieldName]).toBe(null);

    // all ================
    response = await graphqlRequest(qry, 'companies', {});

    expect(response.length).toBe(3);
  };

  test('companies: products info status', async () => {
    const qry = `
      query companies($productsInfoStatus: String) {
        companies(productsInfoStatus: $productsInfoStatus) {
          isProductsInfoValidated
        }
      }
    `;

    await checkStatus({
      qry,
      variableName: 'productsInfoStatus',
      fieldName: 'isProductsInfoValidated',
    });
  });

  test('companies: prequalified status', async () => {
    const qry = `
      query companies($prequalifiedStatus: String) {
        companies(prequalifiedStatus: $prequalifiedStatus) {
          isPrequalified
        }
      }
    `;

    await checkStatus({
      qry,
      variableName: 'prequalifiedStatus',
      fieldName: 'isPrequalified',
    });
  });

  test('companies: qualified status', async () => {
    const qry = `
      query companies($qualifiedStatus: String) {
        companies(qualifiedStatus: $qualifiedStatus) {
          isQualified
        }
      }
    `;

    await checkStatus({
      qry,
      variableName: 'qualifiedStatus',
      fieldName: 'isQualified',
    });
  });

  test('check fields', async () => {
    const _company = await companyFactory({
      validatedProductsInfo: ['code1', 'code2'],
      isProductsInfoValidated: true,
    });

    await auditFactory({ supplierIds: [_company._id], status: 'open' });

    const response = await graphqlRequest(query, 'companies');

    expect(response.length).toBe(1);

    const [company] = response;

    expect(company.isProductsInfoValidated).toBe(true);
    expect(company.validatedProductsInfo).toContain('code1');
    expect(company.validatedProductsInfo).toContain('code2');

    // audits
    expect(company.audits.length).toBe(1);
  });

  test('companies: tier types', async () => {
    const qry = `
      query companies($region: String) {
        companies(region: $region) {
          tierType
        }
      }
    `;

    await companyFactory({ tierType: 'national' });
    await companyFactory({ tierType: 'tier1' });

    const response = await graphqlRequest(qry, 'companies', { region: 'national' });

    expect(response.length).toBe(1);
  });

  test('count by tier type', async () => {
    const qry = `
      query companiesCountByTierType($startDate: Date!, $endDate: Date!) {
        companiesCountByTierType(startDate: $startDate, endDate: $endDate)
      }
    `;

    await companyFactory({ tierType: 'national' });
    await companyFactory({ tierType: 'tier1' });

    const startDate = moment()
      .add(-1, 'day')
      .endOf('day'); // 1 day ago

    const endDate = moment()
      .add(1, 'day')
      .endOf('day'); // tomorrow

    const response = await graphqlRequest(qry, 'companiesCountByTierType', { startDate, endDate });

    expect(response.length).toBe(2);

    const [item1, item2] = response;

    expect(item1._id).toBe('national');
    expect(item1.count).toBe(1);

    expect(item2._id).toBe('tier1');
    expect(item2.count).toBe(1);
  });

  test('count by registered and prequalified status', async () => {
    const qry = `
      query companiesCountByRegisteredVsPrequalified(
        $startDate: Date!,
        $endDate: Date!
        $productCodes: String,
      ) {
        companiesCountByRegisteredVsPrequalified(
          startDate: $startDate,
          endDate: $endDate,
          productCodes: $productCodes
        )
      }
    `;

    const c1Date = new Date();
    const c2Date = moment()
      .add(1, 'day')
      .endOf('day')
      .toDate(); // 1 days later

    // not sent prequalification info
    await companyFactory({
      validatedProductsInfo: ['code1'],
      createdDate: c1Date,
      isSentPrequalificationInfo: false,
    });

    // sent prequalification info, but responded
    await companyFactory({
      validatedProductsInfo: ['code2'],
      createdDate: c2Date,
      isSentPrequalificationInfo: true,
    });

    // sent prequalification info, responded as no
    await companyFactory({
      validatedProductsInfo: ['code1'],
      createdDate: c2Date,
      isSentPrequalificationInfo: true,
      isPrequalified: false,
    });

    // sent prequalification info, responded as yes
    await companyFactory({
      validatedProductsInfo: ['code2'],
      createdDate: c2Date,
      isSentPrequalificationInfo: true,
      isPrequalified: true,
    });

    const startDate = moment()
      .add(-1, 'day')
      .endOf('day'); // 1 day ago

    const endDate = moment()
      .add(2, 'day')
      .endOf('day'); // 2 days later

    const args = { startDate, endDate, productCodes: 'code1,code2' };

    const response = await graphqlRequest(qry, 'companiesCountByRegisteredVsPrequalified', args);

    expect(response[c1Date.toLocaleDateString()]).toEqual({
      registered: 1,
      prequalified: 0,
      notPrequalified: 0,
      prequalificationPending: 0,
    });

    expect(response[c2Date.toLocaleDateString()]).toEqual({
      registered: 3,
      prequalified: 1,
      notPrequalified: 1,
      prequalificationPending: 1,
    });
  });

  test('companies: sort', async () => {
    const qry = `
      query companies($sortField: String, $sortDirection: Int) {
        companies(sortField: $sortField, sortDirection: $sortDirection) {
          basicInfo {
            mnName
          }
          averageDifotScore
        }
      }
    `;

    await companyFactory({ mnName: 'sup1', averageDifotScore: 2 });
    await companyFactory({ mnName: 'sup2', averageDifotScore: 27 });

    // sort by average difot score 1 =====================
    let response = await graphqlRequest(qry, 'companies', { sortField: 'averageDifotScore' });

    let [sup2, sup1] = response;

    expect(sup1.basicInfo.mnName).toBe('sup1');
    expect(sup2.basicInfo.mnName).toBe('sup2');

    // sort by average difot score -1 =====================
    response = await graphqlRequest(qry, 'companies', {
      sortField: 'averageDifotScore',
      sortDirection: -1,
    });

    [sup2, sup1] = response;

    expect(sup1.basicInfo.mnName).toBe('sup1');
    expect(sup2.basicInfo.mnName).toBe('sup2');
  });

  test('companiesTotalCount', async () => {
    const qry = `
      query companiesTotalCount {
        companiesTotalCount
      }
    `;

    await companyFactory({});
    await companyFactory({});

    const count = await graphqlRequest(qry, 'companiesTotalCount', {});

    expect(count).toBe(2);
  });

  const generateQualifDoc = schema => {
    const names = Object.keys(schema.paths);

    const doc = {};

    for (let name of names) {
      doc[name] = true;
    }

    return doc;
  };

  test('companiesPrequalifiedStatus', async () => {
    const qry = `
      query companiesPrequalifiedStatus {
        companiesPrequalifiedStatus
      }
    `;

    // financial info ===========
    const financialInfo = generateQualifDoc(FinancialInfoSchema);
    await qualificationFactory({});
    await qualificationFactory({ financialInfo });
    await qualificationFactory({ financialInfo });
    await qualificationFactory({ financialInfo });

    // business info ===========
    const businessInfo = generateQualifDoc(BusinessInfoSchema);
    await qualificationFactory({ businessInfo });
    await qualificationFactory({ businessInfo });

    // environmental info ===========
    const environmentalInfo = generateQualifDoc(EnvironmentalInfoSchema);
    await qualificationFactory({ environmentalInfo });
    await qualificationFactory({ environmentalInfo });

    // health info ===========
    const healthInfo = generateQualifDoc(HealthInfoSchema);

    const company1 = await companyFactory({ isPrequalified: true });
    const company2 = await companyFactory({ isPrequalified: false });

    await qualificationFactory({ supplierId: company1._id, healthInfo });
    await qualificationFactory({ supplierId: company2._id, healthInfo });

    const response = await graphqlRequest(qry, 'companiesPrequalifiedStatus', {});

    expect(response.financialInfo).toBe(3);
    expect(response.businessInfo).toBe(2);
    expect(response.environmentalInfo).toBe(2);
    expect(response.healthInfo).toBe(2);

    expect(response.approved).toBe(1);
    expect(response.expired).toBe(0);
    expect(response.outstanding).toBe(8);
    expect(response.failed).toBe(1);
  });

  test('company prequalified status object', async () => {
    const qry = `
      query companyByUser {
        companyByUser {
          prequalifiedStatus
        }
      }
    `;

    const company = await companyFactory({});
    const user = await userFactory({ isSupplier: true, companyId: company._id });

    await qualificationFactory({
      supplierId: company._id,
      financialInfo: generateQualifDoc(FinancialInfoSchema),
      businessInfo: generateQualifDoc(BusinessInfoSchema),
      environmentalInfo: generateQualifDoc(EnvironmentalInfoSchema),
      healthInfo: generateQualifDoc(HealthInfoSchema),
    });

    const response = await graphqlRequest(qry, 'companyByUser', {}, { user });

    expect(response.prequalifiedStatus.financialInfo).toBe(true);
    expect(response.prequalifiedStatus.businessInfo).toBe(true);
    expect(response.prequalifiedStatus.environmentalInfo).toBe(true);
    expect(response.prequalifiedStatus.healthInfo).toBe(true);
    expect(response.prequalifiedStatus.isOutstanding).toBe(true);
  });

  test('companiesCountByProductCode', async () => {
    const user = await userFactory({ isSupplier: false });

    const qry = `
      query companiesCountByProductCode {
        companiesCountByProductCode
      }
    `;

    await companyFactory({
      productsInfo: ['a01001', 'b01001'],
      isProductsInfoValidated: true,
    });

    await companyFactory({
      productsInfo: ['a01002', 'c01002'],
      isProductsInfoValidated: true,
      isPrequalified: true,
    });

    const response = await graphqlRequest(qry, 'companiesCountByProductCode', {}, { user });

    expect(response.a.registered).toBe(2);
    expect(response.a.validated).toBe(2);
    expect(response.a.prequalified).toBe(1);

    expect(response.b.registered).toBe(1);
    expect(response.b.validated).toBe(1);
    expect(response.b.prequalified).toBe(0);

    expect(response.c.registered).toBe(1);
    expect(response.c.validated).toBe(1);
    expect(response.c.prequalified).toBe(1);
  });
});
