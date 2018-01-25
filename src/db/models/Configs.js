import mongoose from 'mongoose';
import { field } from './utils';

const DurationAmountSchema = mongoose.Schema(
  {
    duration: field({ type: String }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

const SuppliersDurationAmountSchema = mongoose.Schema(
  {
    supplierIds: field({ type: [String] }),
    duration: field({ type: String }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

const TierTypeDurationAmountSchema = mongoose.Schema(
  {
    tierType: field({ type: String }),
    duration: field({ type: String }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

const SuppliersTierTypeDurationAmountSchema = mongoose.Schema(
  {
    supplierIds: field({ type: [String] }),
    tierType: field({ type: String }),
    duration: field({ type: String }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

// main schema
const ConfigSchema = mongoose.Schema({
  // company info
  logo: field({ type: String, optional: true }),
  name: field({ type: String, optional: true }),
  phone: field({ type: Number, optional: true }),
  email: field({ type: String, optional: true }),
  address: field({ type: String, optional: true }),

  // templates
  eoiTemplate: field({ type: String, optional: true }),
  rfqTemplate: field({ type: String, optional: true }),
  regretLetterTemplate: field({ type: String, optional: true }),
  successFeedbackTemplate: field({ type: String, optional: true }),
  auditTemplate: field({ type: String, optional: true }),

  // Prequalification duration of warranty ========
  // { duration: 'year', amount: 2 }
  prequalificationDow: field({
    type: DurationAmountSchema,
    optional: true,
  }),

  // { supplierIds: ['_id1', '_id2'], duration: 'year', amount: 2 }
  specificPrequalificationDow: field({
    type: SuppliersDurationAmountSchema,
    optional: true,
  }),

  // Desktop audit duration of warranty ===========
  // { duration: 'year', amount: 2 }
  auditDow: field({
    type: DurationAmountSchema,
    optional: true,
  }),

  // { supplierIds: ['_id1', '_id2'], duration: 'year', amount: 2 }
  specificAuditDow: field({
    type: SuppliersDurationAmountSchema,
    optional: true,
  }),

  // Improvement plan duration of warranty =============
  // { tierType: 'national', duration: 'year', amount: 2 }
  improvementPlanDow: field({
    type: TierTypeDurationAmountSchema,
    optional: true,
  }),

  // { supplierIds: ['_id1', '_id2'], tierType: 'national', duration: 'year', amount: 2 }
  specificImprovementPlanDow: field({
    type: SuppliersTierTypeDurationAmountSchema,
    optional: true,
  }),
});

class Config {
  /*
   * Save basic info
   */
  static async saveBasicInfo({ logo, name, phone, email, address }) {
    const config = await this.getConfig();

    await config.update({ logo, name, phone, email, address });

    return this.findOne({ _id: config._id });
  }

  /*
   * Save template
   */
  static async saveTemplate(name, content) {
    const config = await this.getConfig();

    await config.update({ [name]: content });

    return this.findOne({ _id: config._id });
  }

  /*
   * Save pre qualification duration of warranty
   * @param common - {duration: 'year', amount: 2}
   * @param specific - {supplierIds: ['_id'], duration: 'month', amount: 1}
   * @return updated config
   */
  static async savePrequalificationDow({ common, specific }) {
    const config = await this.getConfig();

    await config.update({
      prequalificationDow: common,
      specificPrequalificationDow: specific,
    });

    return this.findOne({ _id: config._id });
  }

  /*
   * Save audit duration of warranty
   * @param common - {duration: 'year', amount: 2}
   * @param specific - {supplierIds: ['_id'], duration: 'month', amount: 1}
   * @return updated config
   */
  static async saveAuditDow({ common, specific }) {
    const config = await this.getConfig();

    await config.update({
      auditDow: common,
      specificAuditDow: specific,
    });

    return this.findOne({ _id: config._id });
  }

  /*
   * Save improvementPlan duration of warranty
   * @param common - {duration: 'year', amount: 2}
   * @param specific - {supplierIds: ['_id1', '_id2'], duration: 'month', amount: 1}
   * @return updated config
   */
  static async saveImprovementPlanDow({ common, specific }) {
    const config = await this.getConfig();

    await config.update({
      improvementPlanDow: common,
      specificImprovementPlanDow: specific,
    });

    return this.findOne({ _id: config._id });
  }

  /*
   * Get or create config
   */
  static async getConfig() {
    const config = await Configs.findOne({});

    if (config) {
      return config;
    }

    return Configs.create({});
  }
}

ConfigSchema.loadClass(Config);

const Configs = mongoose.model('configs', ConfigSchema);

export default Configs;
