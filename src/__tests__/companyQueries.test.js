/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies, BlockedCompanies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
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
    $_ids: [String]
  `;

  const commonValues = `
    search: $search,
    region: $region,
    productCodes: $productCodes,
    isProductsInfoValidated: $isProductsInfoValidated,
    includeBlocked: $includeBlocked,
    isPrequalified: $isPrequalified,
    _ids: $_ids
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

        isPrequalified

        averageDifotScore
        difotScores {
          date
          amount
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

    expect.assertions(2);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['companies', 'companiesExport']) {
      checkLogin(queries[query], {}, { user });
    }
  });

  test('companies', async () => {
    // Creating test data ==============
    await Companies.create({}); // to check empty company ignorance

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
    await BlockedCompanies.block({
      supplierId: blockedCompany._id,
      startDate: today,
      endDate: tomorrow,
    });

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

    // blocked =============
    response = await graphqlRequest(query, 'companies', { includeBlocked: false });

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

  test('companies: isPrequalified', async () => {
    const qry = `
      query companies($isPrequalified: Boolean) {
        companies(isPrequalified: $isPrequalified) {
          isPrequalified
        }
      }
    `;

    await companyFactory({ isPrequalified: true });
    await companyFactory({ isPrequalified: false });

    const response = await graphqlRequest(qry, 'companies', { isPrequalified: true });

    expect(response.length).toBe(1);
    expect(response[0].isPrequalified).toBe(true);
  });

  test('check fields', async () => {
    const validatedDate = new Date();

    await companyFactory({
      validatedProductsInfo: ['code1', 'code2'],
      isProductsInfoValidated: true,
      productsInfoLastValidatedDate: validatedDate,
    });

    const response = await graphqlRequest(query, 'companies');

    expect(response.length).toBe(1);

    const [company] = response;

    expect(company.isProductsInfoValidated).toBe(true);
    expect(company.validatedProductsInfo).toContain('code1');
    expect(company.validatedProductsInfo).toContain('code2');
    expect(new Date(company.productsInfoLastValidatedDate)).toEqual(validatedDate);
  });
});
