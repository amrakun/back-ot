/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { graphql } from 'graphql';
import { connect, disconnect } from '../db/connection';
import schema from '../data';
import { Companies } from '../db/models';
import { companyFactory } from '../db/factories';

describe('reportsQueries', () => {
  beforeAll(() => connect());
  afterAll(() => disconnect());

  let _suppliers = [];

  beforeEach(async () => {
    _suppliers.push(await companyFactory());
    _suppliers.push(await companyFactory({}));
    _suppliers.push(await companyFactory({ mnName: ' ' }));
  });

  afterEach(async () => {
    await Companies.remove({});
  });

  test('reportsSuppliers', async () => {
    const query = `
      query reportsSuppliers(
                          $dateInterval: ReportsSuppliersFilterDateInterval,
                          $affiliation:  ReportsSuppliersFilterAffiliation,
                          $sectCodes:    [String!],
                          $statuses:     [ReportsSuppliersFilterStatus!]
                        ) {
        reportsSuppliers(
                      dateInterval: $dateInterval,
                      affiliation:  $affiliation,
                      sectCodes:    $sectCodes,
                      statuses:     $statuses) {
          _id
          isParentExistingSup
          enName
          mnName
        }
      }
    `;

    const params = {};

    const result = await graphql(schema, query, {}, {}, params);

    // console.log('result: ', result);
    expect(result).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data.reportsSuppliers;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      console.log('row: ', row);
      // console.log('supplier: ', _suppliers[i]);

      expect(row._id).toBe(_suppliers[i]._id);

      if (!_suppliers[i].isParentExistingSup) {
        expect(row.isParentExistingSup).toBeNull();
      }

      expect(row.enName).toBe(_suppliers[i].basicInfo.enName);
      expect(row.mnName).toBe(_suppliers[i].basicInfo.mnName);
    }
  });
});
