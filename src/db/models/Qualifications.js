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
    definations[name] = field({ type: Boolean });
  }

  return mongoose.Schema(definations, { _id: false });
};

const QualificationSchema = mongoose.Schema({
  supplierId: field({ type: String }),
  financialInfo: generateFields(FinancialInfoSchema),
  businessInfo: generateFields(BusinessInfoSchema),
  environmentalInfo: generateFields(EnvironmentalInfoSchema),
  healthInfo: generateFields(HealthInfoSchema),
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

    // updated object
    const qualification = await this.findOne({ supplierId });

    // check is prequalifed ==============
    const sections = [
      { name: 'financialInfo', schema: FinancialInfoSchema },
      { name: 'businessInfo', schema: BusinessInfoSchema },
      { name: 'environmentalInfo', schema: EnvironmentalInfoSchema },
      { name: 'healthInfo', schema: HealthInfoSchema },
    ];

    let isPrequalified = true;

    for (let section of sections) {
      const names = Object.keys(section.schema.paths);

      for (let name of names) {
        const sectionValue = qualification[section.name] || {};

        if (!sectionValue[name]) {
          isPrequalified = false;
        }
      }
    }

    // update company's prequalified status
    await Companies.update({ _id: supplierId }, { $set: { isPrequalified } });

    return qualification;
  }
}

QualificationSchema.loadClass(Qualification);

const Qualifications = mongoose.model('validations', QualificationSchema);

export default Qualifications;
