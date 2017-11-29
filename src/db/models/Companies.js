import mongoose from 'mongoose';
import { field } from './utils';

const CompanySchema = mongoose.Schema({
  name: field({ type: String }),
  createdAt: field({ type: Date }),
});

class Company {
  /**
   * Create a company
   * @param  {Object} doc object
   * @return {Promise} Newly created company object
   */
  static async createCompany(doc) {
    doc.createdAt = new Date();

    return this.create(doc);
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

  /**
   * Delete company
   * @param  {string} _id - company id
   * @return {Promise} Updated company object
   */
  static async removeCompany(_id) {
    const companyObj = await Companies.findOne({ _id });

    if (!companyObj) throw new Error(`Company not found with id ${_id}`);

    return companyObj.remove();
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
