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

const TierTypesDurationAmountSchema = mongoose.Schema(
  {
    national: field({ type: DurationAmountSchema, optional: true }),
    umnugobi: field({ type: DurationAmountSchema, optional: true }),
    tier1: field({ type: DurationAmountSchema, optional: true }),
    tier2: field({ type: DurationAmountSchema, optional: true }),
    tier3: field({ type: DurationAmountSchema, optional: true }),
  },
  { _id: false },
);

const SuppliersTierTypesDurationAmountSchema = mongoose.Schema(
  {
    supplierIds: field({ type: [String] }),
    national: field({ type: DurationAmountSchema, optional: true }),
    umnugobi: field({ type: DurationAmountSchema, optional: true }),
    tier1: field({ type: DurationAmountSchema, optional: true }),
    tier2: field({ type: DurationAmountSchema, optional: true }),
    tier3: field({ type: DurationAmountSchema, optional: true }),
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
  rfqTemplates: field({ type: Object, optional: true }),
  srfqTemplates: field({ type: Object, optional: true }),
  eoiTemplates: field({ type: Object, optional: true }),
  successFeedbackTemplates: field({ type: Object, optional: true }),
  capacityBuildingTemplates: field({ type: Object, optional: true }),
  blockTemplates: field({ type: Object, optional: true }),
  prequalificationTemplates: field({ type: Object, optional: true }),
  desktopAuditTemplates: field({ type: Object, optional: true }),

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
  // { national: { duration: 'year', amount: 2 }, tier1: { duration: 'month' }
  improvementPlanDow: field({
    type: TierTypesDurationAmountSchema,
    optional: true,
  }),

  // { supplierIds: ['_id1', '_id2'], national: { duration: 'year', amount: 2 } }
  specificImprovementPlanDow: field({
    type: SuppliersTierTypesDurationAmountSchema,
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
  static async saveTemplate({ name, kind, from, subject, content }) {
    const config = await this.getConfig();

    const template = config[name] || {};

    template[kind] = { from, subject, content };

    await config.update({ [name]: template });

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
