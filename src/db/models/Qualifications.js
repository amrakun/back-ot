import mongoose from 'mongoose';
import { field } from './utils';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from './Companies';

const generateFields = schema => {
  const names = Object.keys(schema.paths);

  const definations = {};

  for (let name of names) {
    definations[name] = field({ type: Boolean });
  }

  return mongoose.Schema(definations, { _id: false });
};

const QualificationSchema = mongoose.Schema({
  financialInfo: generateFields(FinancialInfoSchema),
  businessInfo: generateFields(BusinessInfoSchema),
  environmentalInfo: generateFields(EnvironmentalInfoSchema),
  healthInfo: generateFields(HealthInfoSchema),
});

class Qualification {
  /**
   * Update sub section info
   * @param {String } company - Company id
   * @param {String} key - financialInfo etc ...
   * @param {Object} value - related update doc
   * @return Updated validation object
   */
  static async updateSection(companyId, section, value) {
    if (await this.findOne({ companyId })) {
      // update
      await this.update({ companyId }, { $set: { [section]: value } });
    }

    // create
    return this.create({ companyId, [section]: value });
  }
}

QualificationSchema.loadClass(Qualification);

const Qualifications = mongoose.model('validations', QualificationSchema);

export default Qualifications;
