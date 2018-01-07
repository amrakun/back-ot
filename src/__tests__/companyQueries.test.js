/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';
import { companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Company queries', () => {
  const commonParams = `
    $search: String,
    $region: String,
    $status: String,
    $productCodes: String,
    $_ids: [String]
  `;

  const commonValues = `
    search: $search,
    region: $region,
    status: $status,
    productCodes: $productCodes,
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

  test('companies', async () => {
    // Creating test data ==============
    await Companies.create({}); // to check empty company ignorance

    const company1 = await companyFactory({
      mnName: 'mn name',
      productsInfo: ['code1', 'code2'],
    });

    await companyFactory({ enName: 'en name', sapNumber: '1441aabb' });

    // When there is no filter, it must return all companies =============
    let response = await graphqlRequest(query, 'companies', {});

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
  });
});
