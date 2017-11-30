/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';
import { companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());


const checkBasicInfo = (basicInfo, doc) => {
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
}

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

    checkBasicInfo(company.basicInfo, doc);
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
    const company = await companyFactory();

    const doc = {
      enName: 'enNameUpdated',
      mnName: 'mnNameUpdated',
      isRegisteredOnSup: false,
      address: 'AddressUpdated',
      address2: 'Address2Updated',
      address3: 'Address3Updated',
      townOrCity: 'UlaanbaatarUpdated',
      province: 'UlaanbaatarUpdated',
      zipCode: 977,
      country: 'MongoliaUpdated',
      registeredInCountry: 'MongoliaUpdated',
      registeredInAimag: 'UmnugivUpdated',
      registeredInSum: 'BayntsagaanUpdated',
      isSubContractor: false,
      corporateStructure: 'PartnershipUpdated',
      registrationNumber: 33483948394,
      email: 'companyUpdated@gmail.com',
      foreignOwnershipPercentage: 41,
      totalNumberOfEmployees: 101,
      totalNumberOfMongolianEmployees: 81,
      totalNumberOfUmnugoviEmployees: 11,
    }

    const updatedCompany = await Companies.updateBasicInfo(company._id, doc);

    checkBasicInfo(updatedCompany.basicInfo, doc);
  });

  test('Update contact info', async () => {
    const company = await companyFactory();

    const doc = {
      name: 'name',
      address: 'Address',
      address2: 'Address2',
      address3: 'Address3',
      townOrCity: 'Ulaanbaatar',
      province: 'Ulaanbaatar',
      zipCode: 976,
      country: 'Mongolia',
      phone: 24224242,
      phone2: 24224243,
      email: 'contact@gmail.com',
    }

    const updatedCompany = await Companies.updateContactInfo(company._id, doc);
    const contactInfo = updatedCompany.contactInfo;

    expect(contactInfo.name).toBe(doc.name);
    expect(contactInfo.address).toBe(doc.address);
    expect(contactInfo.address2).toBe(doc.address2);
    expect(contactInfo.townOrCity).toBe(doc.townOrCity);
    expect(contactInfo.province).toBe(doc.province);
    expect(contactInfo.zipCode).toBe(doc.zipCode);
    expect(contactInfo.country).toBe(doc.country);
    expect(contactInfo.email).toBe(doc.email);
    expect(contactInfo.phone).toBe(doc.phone);
    expect(contactInfo.phone2).toBe(doc.phone2);
  });
});
