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

  test('Create company: validations', async () => {
    expect.assertions(2);

    // duplicate english company name
    try {
      await Companies.createCompany({ enName: _company.enName });
    } catch (e) {
      expect(e.message).toBe('Duplicated english name');
    }

    // duplicate mongolian company name
    try {
      await Companies.createCompany({ enName: 'enName', mnName: _company.mnName });
    } catch (e) {
      expect(e.message).toBe('Duplicated mongolian name');
    }
  });

  test('Create company: valid', async () => {
    const doc = {
      enName: 'enName',
      mnName: 'mnName',
      isRegisteredOnSup: true,
      address: 'Address',
      address2: 'Address2',
      address3: 'Address3',
      townOrCity: 'Ulaanbaatar',
      province: 'Ulaanbaatar',
      zipCode: 976,
      country: 'Mongolia',
      registeredInCountry: 'Mongolia',
      registeredInAimag: 'Umnugiv',
      registeredInSum: 'Bayntsagaan',
      isSubContractor: true,
      corporateStructure: 'Partnership',
      registrationNumber: 334839483943,
      email: 'company@gmail.com',
      foreignOwnershipPercentage: 40,
      totalNumberOfEmployees: 100,
      totalNumberOfMongolianEmployees: 80,
      totalNumberOfUmnugoviEmployees: 10,
    }

    const company = await Companies.createCompany(doc);
    const basicInfo = company.basicInfo;

    expect(basicInfo.enName).toBe(doc.enName);
    expect(basicInfo.mnName).toBe(doc.mnName);
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
    expect(basicInfo.isSubContractor).toBe(doc.isSubContractor);
    expect(basicInfo.corporateStructure).toBe(doc.corporateStructure);
    expect(basicInfo.registrationNumber).toBe(doc.registrationNumber);
    expect(basicInfo.email).toBe(doc.email);
    expect(basicInfo.foreignOwnershipPercentage).toBe(doc.foreignOwnershipPercentage);
    expect(basicInfo.totalNumberOfEmployees).toBe(doc.totalNumberOfEmployees);
    expect(basicInfo.totalNumberOfMongolianEmployees).toBe(doc.totalNumberOfMongolianEmployees);
    expect(basicInfo.totalNumberOfUmnugoviEmployees).toBe(doc.totalNumberOfUmnugoviEmployees);
  });
});
