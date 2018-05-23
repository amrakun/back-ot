import mongoose from 'mongoose';
import moment from 'moment';
import { field } from './utils';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from './Companies';

import { Configs, Companies } from './';

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
  /*
   * Check per sections' all values are true
   */
  static isSectionPassed(sectionSchema) {
    if (!sectionSchema) {
      return false;
    }

    const section = sectionSchema.toJSON();
    const fieldNames = Object.keys(section);

    let isPassed = true;

    for (const fieldName of fieldNames) {
      if (!section[fieldName]) {
        isPassed = false;
        break;
      }
    }

    return isPassed;
  }

  /*
   * Check whether approved, failed, expired, outstanding
   */
  static async status(supplierId) {
    const supplier = await Companies.findOne({ _id: supplierId });
    const qualif = await this.findOne({ supplierId });

    if (!qualif) {
      return {};
    }

    // approved
    if (supplier.isPrequalified) {
      return { isApproved: true };
    }

    // failed
    if (supplier.isPrequalified === false) {
      return { isFailed: true };
    }

    // outstanding
    return { isOutstanding: true };
  }

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
    await Companies.update(
      { _id: supplierId },
      {
        $set: {
          isPrequalified: status,
          prequalifiedDate: new Date(),
          isPrequalificationInfoEditable: false,
        },
      },
    );

    return Companies.findOne({ _id: supplierId });
  }

  /*
   * Reset supplier's prequalification status using config
   * @return - Updated supplier
   */
  static async resetPrequalification(supplierId) {
    const config = await Configs.getConfig();

    let prequalificationConfig = config.prequalificationDow || {};

    const specific = config.specificPrequalificationDow || {};

    if (specific && specific.supplierIds && specific.supplierIds.includes(supplierId)) {
      prequalificationConfig = specific;
    }

    const { duration, amount } = prequalificationConfig;

    const supplier = await Companies.findOne({ _id: supplierId });

    // ignore not prequalified suppliers
    if (!supplier.isPrequalified) {
      return 'notPrequalified';
    }

    const prequalifiedDate = supplier.prequalifiedDate;

    if (moment().diff(prequalifiedDate, `${duration}s`) >= amount) {
      return this.prequalify(supplierId, false);
    }

    return 'dueDateIsNotHere';
  }
}

QualificationSchema.loadClass(Qualification);

const Qualifications = mongoose.model('qualifications', QualificationSchema);

export default Qualifications;
