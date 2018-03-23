/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory, auditFactory } from '../db/factories';

import queries from '../data/resolvers/queries/companies';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  const commonParams = `
    $search: String,
    $region: String,
    $productCodes: String,
    $isProductsInfoValidated: Boolean,
    $includeBlocked: Boolean,
    $isPrequalified: Boolean,
    $_ids: [String],
    $perPage: Int,
    $page: Int,
  `;

  const commonValues = `
    search: $search,
    region: $region,
    productCodes: $productCodes,
    isProductsInfoValidated: $isProductsInfoValidated,
    includeBlocked: $includeBlocked,
    isPrequalified: $isPrequalified,
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
        productsInfoLastValidatedDate

        isSentRegistrationInfo
        isSentPrequalificationInfo

        isPrequalified
        prequalifiedDate
        isQualified

        averageDifotScore

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
  });

  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(4);

    const user = await userFactory({ isSupplier: true });

    const items = [
      'companies',
      'companiesExport',
      'companyDetailExport',
      'companiesValidatedProductsInfoExport',
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
      validatedProductsInfo: ['code1', 'code2'],
      isProductsInfoValidated: true,
    });

    // block this supplier
    const today = moment().endOf('day');
    const tomorrow = moment()
      .add(1, 'day')
      .endOf('day');

    const blockedCompany = await companyFactory({ enName: 'blocked' });

    await BlockedCompanies.block(
      {
        supplierId: blockedCompany._id,
        startDate: today,
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
    expect(response[0].validatedProductsInfo).toContain('code1');

    // two values
    response = await graphqlRequest(query, 'companies', { productCodes: 'code1,code2' });

    expect(response.length).toBe(1);
    expect(response[0].validatedProductsInfo).toContain('code1');
    expect(response[0].validatedProductsInfo).toContain('code2');

    // no result
    response = await graphqlRequest(query, 'companies', { productCodes: 'code3' });

    expect(response.length).toBe(0);

    // filter by _ids =============
    response = await graphqlRequest(query, 'companies', { _ids: [company1._id] });

    expect(response.length).toBe(1);

    // filter isValidated =============
    response = await graphqlRequest(query, 'companies', { isProductsInfoValidated: true });

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

    // 51-75
    response = await graphqlRequest(qry, 'companies', { difotScore: '51-75' });
    expect(response.length).toBe(1);
    expect(response[0].averageDifotScore).toBe(52);

    // 76-100
    response = await graphqlRequest(qry, 'companies', { difotScore: '76-100' });
    expect(response.length).toBe(1);
    expect(response[0].averageDifotScore).toBe(77);
  });

  // test checkbox typed filters
  const checkbox = async ({ qry, name }) => {
    await companyFactory({ [name]: true });
    await companyFactory({ [name]: false });

    // checked ================
    let response = await graphqlRequest(qry, 'companies', { [name]: true });

    expect(response.length).toBe(1);
    expect(response[0][name]).toBe(true);

    // unchecked ================
    response = await graphqlRequest(qry, 'companies', { [name]: false });

    expect(response.length).toBe(1);
    expect(response[0][name]).toBe(false);

    // undefined ================
    response = await graphqlRequest(qry, 'companies', {});

    expect(response.length).toBe(2);
  };

  test('companies: isProductsInfoValidated', async () => {
    const qry = `
      query companies($isProductsInfoValidated: Boolean) {
        companies(isProductsInfoValidated: $isProductsInfoValidated) {
          isProductsInfoValidated
        }
      }
    `;

    await checkbox({ qry, name: 'isProductsInfoValidated' });
  });

  test('companies: isPrequalified', async () => {
    const qry = `
      query companies($isPrequalified: Boolean) {
        companies(isPrequalified: $isPrequalified) {
          isPrequalified
        }
      }
    `;

    await checkbox({ qry, name: 'isPrequalified' });
  });

  test('companies: isQualified', async () => {
    const qry = `
      query companies($isQualified: Boolean) {
        companies(isQualified: $isQualified) {
          isQualified
        }
      }
    `;

    await checkbox({ qry, name: 'isQualified' });
  });

  test('check fields', async () => {
    const validatedDate = new Date();

    const _company = await companyFactory({
      validatedProductsInfo: ['code1', 'code2'],
      isProductsInfoValidated: true,
      productsInfoLastValidatedDate: validatedDate,
    });

    await auditFactory({ supplierIds: [_company._id], status: 'open' });

    const response = await graphqlRequest(query, 'companies');

    expect(response.length).toBe(1);

    const [company] = response;

    expect(company.isProductsInfoValidated).toBe(true);
    expect(company.validatedProductsInfo).toContain('code1');
    expect(company.validatedProductsInfo).toContain('code2');
    expect(new Date(company.productsInfoLastValidatedDate)).toEqual(validatedDate);

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

    await companyFactory({
      validatedProductsInfo: ['code1'],
      createdDate: c1Date,
    });

    await companyFactory({
      validatedProductsInfo: ['code2'],
      createdDate: c2Date,
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

    expect(response[c1Date.toLocaleDateString()]).toEqual({ registered: 1, prequalified: 0 });
    expect(response[c2Date.toLocaleDateString()]).toEqual({ registered: 1, prequalified: 1 });
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

    let [sup1, sup2] = response;

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
});
