import mongoose from 'mongoose';
import { field } from './utils';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from './Companies';

import { Companies } from './';

const generateFields = schema => {
  const names = Object.keys(schema.paths);

  const definations = {};

  for (let name of names) {
    const options = schema.paths[name].options;

    definations[name] = field({ type: Boolean, optional: options.optional || false });
  }

  return mongoose.Schema(definations, { _id: false });
};

const QualificationSchema = mongoose.Schema({
  supplierId: field({ type: String }),
  financialInfo: generateFields(FinancialInfoSchema),
  businessInfo: generateFields(BusinessInfoSchema),
  environmentalInfo: generateFields(EnvironmentalInfoSchema),
  healthInfo: generateFields(HealthInfoSchema),

  tierType: field({
    type: String,
    enum: ['national', 'umnugobi', 'tier1', 'tier2', 'tier3'],
    optional: true,
  }),
});

class Qualification {
  /**
   * Update sub section info
   * @param {String } supplierId - Company id
   * @param {String} key - financialInfo etc ...
   * @param {Object} value - related update doc
   * @return Updated validation object
   */
  static async updateSection(supplierId, section, value) {
    if (await this.findOne({ supplierId })) {
      // update
      await this.update({ supplierId }, { $set: { [section]: value } });
    } else {
      // create
      await this.create({ supplierId, [section]: value });
    }

    return this.findOne({ supplierId });
  }

  /*
   * Save tier type
   */
  static async saveTierType(supplierId, section, value) {
    const qualification = await this.updateSection(supplierId, section, value);

    // update supplier's tier type
    await Companies.update({ _id: supplierId }, { $set: { tierType: value } });

    return qualification;
  }

  /*
   * Mark supplier as prequalified
   * @return - Updated supplier
   */
  static async prequalify(supplierId, status) {
    // update supplier's tier type
    await Companies.update({ _id: supplierId }, { $set: { isPrequalified: status } });

    return Companies.findOne({ _id: supplierId });
  }
}

QualificationSchema.loadClass(Qualification);

const Qualifications = mongoose.model('qualifications', QualificationSchema);

export default Qualifications;
