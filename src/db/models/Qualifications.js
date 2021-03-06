import mongoose from 'mongoose';
import moment from 'moment';
import { field, getFieldsBySchema } from './utils';
import {
  FinancialInfoSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
} from './Companies';

import { Configs, Companies } from './';

export const generateFields = (schema, type = Boolean) => {
  const names = getFieldsBySchema(schema);

  const definitions = {};

  for (let name of names) {
    const options = schema.paths[name].options;

    definitions[name] = field({
      type,
      optional: options.optional || false,
      label: options.label,
    });
  }

  return mongoose.Schema(definitions, { _id: false });
};

export const QualificationSchema = mongoose.Schema({
  createdDate: field({ type: Date, label: 'Created date' }),
  supplierId: field({ type: String, label: 'Supplier' }),
  financialInfo: generateFields(FinancialInfoSchema),
  businessInfo: generateFields(BusinessInfoSchema),
  environmentalInfo: generateFields(EnvironmentalInfoSchema),
  healthInfo: generateFields(HealthInfoSchema),

  tierType: field({
    type: String,
    enum: ['national', 'umnugovi', 'tier1', 'tier2', 'tier3'],
    optional: true,
    label: 'Tier type',
  }),
});

class Qualification {
  static getFieldsBySchema(...args) {
    return getFieldsBySchema(...args);
  }

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
      await this.create({ supplierId, [section]: value, createdDate: new Date() });
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
    const company = await Companies.findOne({ _id: supplierId });

    if (company.isDueDiligenceValidated === true) {
      throw Error('Not due diligence');
    }

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
   * Get prequalification duration, amount config for given supplierId
   */
  static async getPrequalificationConfig(supplierId) {
    const config = await Configs.getConfig();

    let prequalificationConfig = config.prequalificationDow || {};

    const specific = config.specificPrequalificationDow || {};

    if (specific && specific.supplierIds && specific.supplierIds.includes(supplierId)) {
      prequalificationConfig = specific;
    }

    return prequalificationConfig;
  }

  /*
   * Generate expiry date
   */
  static async getExpiryDate(supplierId) {
    const { duration, amount } = await this.getPrequalificationConfig(supplierId);

    const supplier = await Companies.findOne({ _id: supplierId });

    // ignore not prequalified suppliers
    if (!supplier.isPrequalified) {
      return;
    }

    const prequalifiedDate = supplier.prequalifiedDate;

    return moment(prequalifiedDate)
      .add(amount, `${duration}s`)
      .toDate();
  }

  /*
   * Reset supplier's prequalification status using config
   * @return - Updated supplier
   */
  static async resetPrequalification(supplierId) {
    const { duration, amount } = await this.getPrequalificationConfig(supplierId);

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
