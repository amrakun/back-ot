/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { graphql } from 'graphql';
import { connect, disconnect } from '../db/connection';
import schema from '../data';
import { Companies } from '../db/models';
import { supplierFactory } from '../db/factories';

describe('reportsQueries', () => {
  beforeAll(() => connect());
  afterAll(() => disconnect());

  let _suppliers = [];

  beforeEach(async () => {
    _suppliers.push(
      await supplierFactory({
        isRegisteredOnSup: null,
        enName: null,
        mnName: null,
        isPrequalified: null,
        difotScores: null,
        isProductsInfoValidated: null,
        address: null,
        address2: null,
        address3: null,
        townOrCity: null,
        province: null,
        zipCode: null,
        country: null,
        registeredInCountry: null,
        registeredInAimag: null,
        registeredInSum: null,
        isChinese: null,
        registrationNumber: null,
        certificateOfRegistration: null,
        website: null,
        email: null,
        phone: null,
        foreignOwnershipPercentage: null,
        totalNumberOfEmployees: null,
        totalNumberOfMongolianEmployees: null,
        totalNumberOfUmnugoviEmployees: null,
      }),
    );

    _suppliers.push(await supplierFactory({}));
    _suppliers.push(await supplierFactory({ mnName: ' ' }));
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
          isRegisteredOnSup
          enName
          mnName
          isPrequalified
          difotScores {
            date
            amount
          }
          isProductsInfoValidated
          address
          address2
          address3
          townOrCity
          country
          province
          registeredInCountry
          registeredInAimag
          registeredInSum
          isChinese
          registrationNumber
          certificateOfRegistration
          website
          email
          phone
          foreignOwnershipPercentage
          totalNumberOfEmployees
          totalNumberOfMongolianEmployees
          totalNumberOfUmnugoviEmployees
        }
      }
    `;

    const params = {};

    const result = await graphql(schema, query, {}, {}, params);

    // console.log('result: ', result.data.reportsSuppliers[0]);
    expect(result).toBeDefined();
    expect(result.errors).toBeUndefined();

    for (let i = 0, data = result.data.reportsSuppliers; i < data.length; i++) {
      const row = data[i],
        supplier = _suppliers[i];
      expect(row._id).toEqual(supplier._id);
      expect(row.isRegisteredOnSup).toBe(row.isRegisteredOnSup || false);
      expect(row.enName).toBe(supplier.basicInfo.enName || '');
      expect(row.mnName).toBe(supplier.basicInfo.mnName || '');
      expect(row.isPrequalified).toBe(supplier.isPrequalified);
      expect(row.difotScores).toEqual(supplier.difotScores);
      expect(row.isProductInfoValidated).toEqual(supplier.isProductInfoValidated);
      expect(row.address).toBe(supplier.basicInfo.address || '');
      expect(row.address2).toBe(supplier.basicInfo.address2 || '');
      expect(row.address3).toBe(supplier.basicInfo.address3 || '');
      expect(row.townOrCity).toBe(supplier.basicInfo.townOrCity || '');
      expect(row.country).toBe(supplier.basicInfo.country || '');
      expect(row.province).toBe(supplier.basicInfo.province || '');
      expect(row.registeredInCountry).toBe(supplier.basicInfo.registeredInCountry || '');
      expect(row.registeredInAimag).toBe(supplier.basicInfo.registeredInAimag || '');
      expect(row.registeredInSum).toBe(supplier.basicInfo.registeredInSum || '');
      expect(row.isChinese).toBe(supplier.basicInfo.isChinese || false);
      expect(row.registrationNumber).toBe(supplier.basicInfo.registrationNumber || 0);
      expect(row.certificateOfRegistration).toBe(row.certificateOfRegistration || false);
      expect(row.website).toBe(supplier.basicInfo.website || '');
      expect(row.email).toBe(supplier.basicInfo.email || '');
      expect(row.phone).toBe(supplier.basicInfo.phone || '');
      expect(row.foreignOwnershipPercentage).toBe(
        supplier.basicInfo.foreignOwnershipPercentage || '',
      );
      expect(row.totalNumberOfEmployees).toBe(supplier.basicInfo.totalNumberOfEmployees || 0);
      expect(row.totalNumberOfMongolianEmployees).toBe(
        supplier.basicInfo.totalNumberOfMongolianEmployees || 0,
      );
      expect(row.totalNumberOfUmnugoviEmployees).toBe(
        supplier.basicInfo.totalNumberOfUmnugoviEmployees || 0,
      );
    }
  });
});
