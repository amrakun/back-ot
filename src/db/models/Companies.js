import mongoose from 'mongoose';
import { field } from './utils';

// basic info
const BasicInfoSchema = mongoose.Schema({
  enName: field({ type: String }),
  mnName: field({ type: String }),
  isRegisteredOnSup: field({ type: Boolean }),
  address: field({ type: String }),
  address2: field({ type: String, optional: true }),
  address3: field({ type: String, optional: true }),
  townOrCity: field({ type: String }),
  province: field({ type: String }),
  zipCode: field({ type: Number }),
  country: field({ type: String }),
  registeredInCountry: field({ type: String }),
  registeredInAimag: field({ type: String }),
  registeredInSum: field({ type: String }),
  isSubContractor: field({ type: Boolean }),
  corporateStructure: field({ type: String }),
  registrationNumber: field({ type: Number }),
  email: field({ type: String }),
  foreignOwnershipPercentage: field({ type: Number }),
  totalNumberOfEmployees: field({ type: Number }),
  totalNumberOfMongolianEmployees: field({ type: Number }),
  totalNumberOfUmnugoviEmployees: field({ type: Number }),
}, { _id: false });

// contact info
const ContactInfoSchema = mongoose.Schema({
  name: field({ type: String }),
  jobTitle: field({ type: String }),
  isRegisteredOnSup: field({ type: Boolean }),
  address: field({ type: String }),
  address2: field({ type: String, optional: true }),
  address3: field({ type: String, optional: true }),
  townOrCity: field({ type: String }),
  province: field({ type: String }),
  zipCode: field({ type: Number }),
  country: field({ type: String }),
  registrationNumber: field({ type: Number }),
  phone: field({ type: Number }),
  phone2: field({ type: Number }),
  email: field({ type: String }),
}, { _id: false });


// Main schema
const CompanySchema = mongoose.Schema({
  basicInfo: BasicInfoSchema,
  contactInfo: ContactInfoSchema
});


class Company {
  /**
   * Create a company
   * @param  {Object} doc object
   * @return {Promise} Newly created company object
   */
  static async createCompany(basicInfo) {
    const { enName, mnName } = basicInfo;

    await this.checkNames({ enName, mnName });

    return this.create({ basicInfo });
  }

  /**
   * Update basic info
   * @param  {String} _id - company id
   * @param  {Object} basicInfo - company basic info
   * @return {Promise} Updated company object
   */
  static async updateBasicInfo(_id, basicInfo) {
    const { enName, mnName } = basicInfo;

    // validations
    await this.checkNames({ _id, enName, mnName });

    // update
    await Companies.update({ _id }, { $set: { basicInfo } });

    return Companies.findOne({ _id });
  }

  /**
   * Update contact info
   * @param  {String} _id - company id
   * @param  {Object} contactInfo - company contact info
   * @return {Promise} Updated company object
   */
  static async updateContactInfo(_id, contactInfo) {
    // update
    await Companies.update({ _id }, { $set: { contactInfo } });

    return Companies.findOne({ _id });
  }

  /*
   * Check english and mongolian names duplication
   */
  static async checkNames({ _id, enName, mnName }) {
    if (await this.findOne({ _id: { $ne: _id }, enName: enName })) {
      throw new Error('Duplicated english name');
    }

    if (await this.findOne({ _id: { $ne: _id }, mnName: mnName })) {
      throw new Error('Duplicated mongolian name');
    }
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
