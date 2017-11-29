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


// Main schema
const CompanySchema = mongoose.Schema({
  basicInfo: BasicInfoSchema,
});


class Company {
  /**
   * Create a company
   * @param  {Object} doc object
   * @return {Promise} Newly created company object
   */
  static async createCompany(basicInfo) {
    if (await this.findOne({ enName: basicInfo.enName })) {
      throw new Error('Duplicated english name');
    }

    if (await this.findOne({ mnName: basicInfo.mnName })) {
      throw new Error('Duplicated mongolian name');
    }

    return this.create({ basicInfo });
  }

  /**
   * Update a company
   * @param  {string} _id - company id
   * @return {Promise} Updated company object
   */
  static async updateCompany(_id, fields) {
    await Companies.update({ _id }, { $set: { ...fields } });
    return Companies.findOne({ _id });
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
