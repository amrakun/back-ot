/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { graphql } from 'graphql';
import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import schema from '../data';
import { Companies, Tenders } from '../db/models';
import { supplierFactory, tenderFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('reportsQueries', () => {
  describe('reportsSuppliers', async () => {
    let _query = `
      query reportsSuppliers(
                          $productCode:    [String!],
                          $isPrequalified: Boolean) {
        reportsSuppliers(
                      productCode:    $productCode,
                      isPrequalified: $isPrequalified) {
          _id
          isRegisteredOnSup
          enName
          mnName
          isPrequalified
          averageDifotScore
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

    afterEach(async () => {
      await Companies.remove({});
      await Tenders.remove({});
    });

    test('reportsSuppliers', async () => {
      const suppliers = [];

      suppliers.push(
        await supplierFactory({
          isRegisteredOnSup: null,
          enName: null,
          mnName: null,
          isPrequalified: null,
          averageDifotScore: null,
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

      suppliers.push(await supplierFactory({}));
      suppliers.push(await supplierFactory({}));

      const params = {};

      const result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      for (let i = 0, data = result.data.reportsSuppliers; i < data.length; i++) {
        const row = data[i],
          supplier = suppliers[i];
        expect(row._id).toEqual(supplier._id.toString());
        expect(row.isRegisteredOnSup).toBe(row.isRegisteredOnSup || false);
        expect(row.enName).toBe(supplier.basicInfo.enName || '');
        expect(row.mnName).toBe(supplier.basicInfo.mnName || '');
        expect(row.isPrequalified).toBe(supplier.isPrequalified);
        expect(row.averageDifotScore).toEqual(supplier.averageDifotScore || 0);
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

    test('reportsSuppliers filters', async () => {
      let params = {};

      let result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      params = {
        isPrequalified: false,
        productCode: null,
      };

      result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      await supplierFactory({
        validatedProductsInfo: ['aaa123', 'aaa456'],
      });
      await supplierFactory({
        validatedProductsInfo: ['bbb123', 'bbb456'],
        isPrequalified: true,
      });
      await supplierFactory({
        validatedProductsInfo: ['aaa123', 'bbb123', 'ccc123', 'ccc456'],
        isPrequalified: true,
      });
      await supplierFactory({
        validatedProductsInfo: ['bbb123', 'ddd123', 'ddd456'],
        isPrequalified: true,
      });
      await supplierFactory({
        validatedProductsInfo: ['aaa123', 'bbb123', 'eee123', 'eee456'],
      });

      params = {
        productCode: ['aaa123'],
      };

      result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      expect(result.data.reportsSuppliers.length).toBe(3);

      params = {
        productCode: ['aaa123', 'bbb123'],
      };

      result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      expect(result.data.reportsSuppliers.length).toBe(2);

      params = {
        isPrequalified: true,
      };

      result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      expect(result.data.reportsSuppliers.length).toBe(3);

      params = {
        isPrequalified: false,
      };

      result = await graphql(schema, _query, {}, {}, params);

      expect(result).toBeDefined();
      expect(result.errors).toBeUndefined();

      expect(result.data.reportsSuppliers.length).toBe(2);
    });

    // describe('reportsTenders', async () => {
    //   beforeAll(async () => {
    //     await Companies.remove({});
    //     await Tenders.remove({});
    //   });

    //   let _query = `
    //     query reportsTenders(
    //                         $publishDate: Date,
    //                         $closeDate:   Date,
    //                         $type:        ReportsTendersType,
    //                       ) {
    //       reportsTenders(
    //                     publishDate:  $publishDate,
    //                     closeDate:    $closeDate,
    //                     type:         $type) {
    //         _id
    //         type
    //         number
    //         content
    //         suppliers {
    //           _id
    //         }
    //         publishDate
    //         closeDate
    //         status
    //         sentRegretLetter
    //       }
    //     }
    //   `;
    //   test('reportsTenders', async () => {
    //     const params = {};

    //     let result = await graphql(schema, _query, {}, {}, params);

    //     expect(result).toBeDefined();
    //     expect(result.errors).toBeUndefined();

    //     const companyA = await companyFactory({}),
    //       companyB = await companyFactory({}),
    //       companyC = await companyFactory({});

    //     await tenderFactory({ supplierIds: [companyA._id] });
    //     await tenderFactory({ supplierIds: [companyB._id] });
    //     await tenderFactory({ supplierIds: [companyC._id] });

    //     result = await graphql(schema, _query, {}, {}, params);

    //     expect(result).toBeDefined();
    //     expect(result.errors).toBeUndefined();

    //     // console.log('result: ', result.data.reportsTenders[0]);

    //     expect(result.data.reportsTenders.length).toBe(3);

    //     // attribute checks
    //   });

    // TODO
    // test('reportsTenders filter ', async () => {
    // });
  });
});
