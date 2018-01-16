import mongoose from 'mongoose';
import { field } from './utils';

// Audit schema
const AuditSchema = mongoose.Schema({
  createdUserId: field({ type: String }),
  date: field({ type: Date }),
  supplierIds: field({ type: [String] }),
});

class Audit {
  /**
   * Create new audit
   * @param {Object} doc - audit fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created audit object
   */
  static createAudit(doc, userId) {
    return this.create({ ...doc, createdUserId: userId });
  }
}

AuditSchema.loadClass(Audit);

const Audits = mongoose.model('audits', AuditSchema);

// Response ===========================

// basic info
const BasicInfoSchema = mongoose.Schema(
  {
    // Share of OT related income in total income
    sotri: field({ type: String }),

    // Share of OT included employment
    sotie: field({ type: String }),
  },
  { _id: false },
);

const ReplyRecommendSchema = mongoose.Schema(
  {
    supplierComment: field({ type: String }),
    supplierAnswer: field({ type: Boolean }),

    auditorComment: field({ type: String }),
    auditorRecommendation: field({ type: String }),
    auditorScore: field({ type: Boolean }),
  },
  { _id: false },
);

// core hseq
const CoreHseqInfoSchema = mongoose.Schema(
  {
    // Does the organization have a health safety & environment management system
    doesHaveHealthSafety: ReplyRecommendSchema,

    // Does the organization have a documented drug and alcohol policy
    doesHaveDocumentedPolicy: ReplyRecommendSchema,

    // Does the organization perform pre employment
    doesPerformPreemployment: ReplyRecommendSchema,

    // Do the organizations work procedures conform to local statutory
    doWorkProceduresConform: ReplyRecommendSchema,

    // Does the organization have a system or process for tracking
    doesHaveTrackingSystem: ReplyRecommendSchema,

    // Does the organization have valid industry
    doesHaveValidIndustry: ReplyRecommendSchema,

    // Does the organization have formal process for reporting and investigating
    // incidents
    doesHaveFormalProcessForReporting: ReplyRecommendSchema,

    // Does the organization have liability insurance which meets OT's
    // minimum requirements
    doesHaveLiabilityInsurance: ReplyRecommendSchema,

    // Does the organization have formal process for health safetiy
    // incidents
    doesHaveFormalProcessForHealth: ReplyRecommendSchema,
  },
  { _id: false },
);

// human resource management
const HrInfoSchema = mongoose.Schema(
  {
    workContractManagement: ReplyRecommendSchema,
    jobDescriptionProcedure: ReplyRecommendSchema,
    trainingDevelopment: ReplyRecommendSchema,
    employeePerformanceManagement: ReplyRecommendSchema,
    timeKeepingManagement: ReplyRecommendSchema,
    managementOfPractises: ReplyRecommendSchema,
    managementOfWorkforce: ReplyRecommendSchema,
    employeeAwareness: ReplyRecommendSchema,
    employeeSelection: ReplyRecommendSchema,
    employeeExitManagement: ReplyRecommendSchema,
    grievanceAndFairTreatment: ReplyRecommendSchema,
  },
  { _id: false },
);

// business integrity info
const BusinessInfoSchema = mongoose.Schema(
  {
    // Does your company have in place a policy statement
    doesHavePolicyStatement: ReplyRecommendSchema,

    // Are these and procedures in place to ensure that your policies or codes
    // of conduct are effectively implemented throught your company
    ensureThroughoutCompany: ReplyRecommendSchema,

    // Are these and procedures in place to ensure that your policies or codes
    // of conduct are effectively implemented throught your supply chain
    ensureThroughoutSupplyChain: ReplyRecommendSchema,

    // Have your company been subject to any external investigation
    haveBeenSubjectToInvestigation: ReplyRecommendSchema,

    // Does your company have a documented policy in place to prevent corruption
    doesHaveDocumentedPolicy: ReplyRecommendSchema,

    // If yes to above question who is responsible person/function for the
    // compliance/anti-corruption program
    whoIsResponsibleForPolicy: ReplyRecommendSchema,
  },
  { _id: false },
);

const AuditReplyRecommendSchema = mongoose.Schema({
  auditId: field({ type: String }),
  supplierId: field({ type: String }),

  basicInfo: BasicInfoSchema,
  coreHseqInfo: CoreHseqInfoSchema,
  hrInfo: HrInfoSchema,
  businessInfo: BusinessInfoSchema,
});

class AuditResponse {
  /**
   * Create or update sections that supplier reply then auditor recomment
   * shaped sections like coreHseqInfo
   *
   * @param {String } auditId - Audit id
   * @param {String } supplierId - Supplier id
   * @param {String} name - basicInfo, coreHSEQ etc ...
   * @param {Object} doc - Update doc shaped like below
   *
   * {
   *    doesHaveHealthSafety: {
   *      supplierComment: 'comment',
   *      supplierAnswer: true
   *    }
   *
   *    doesHaveDocumentedPolicy: {
   *      auditorComment: 'comment',
   *      auditorAnswer: false
   *    }
   * }
   *
   *
   * @return Created or updated response object
   */
  static saveReplyRecommentSection(args) {
    return this.saveSection(args, async ({ name, doc, selector }) => {
      // Generating update query to only peace of information in given
      // section
      const updateQuery = {};

      // doesHaveHealthSafety, doesHaveDocumentedPolicy ...
      const fieldNames = Object.keys(doc);

      for (let fieldName of fieldNames) {
        // supplierComment, supplierAnswer, auditorComment ...
        const subFieldNames = Object.keys(doc[fieldName]);

        for (let subFieldName of subFieldNames) {
          // 'comment' true, 'answer' ...
          const subFieldValue = doc[fieldName][subFieldName];

          // coreHseqInfo.doesHaveHealthSafety.supplierComment = 'comment' ...
          updateQuery[`${name}.${fieldName}.${subFieldName}`] = subFieldValue;
        }
      }

      // do not override whole section values
      await this.update(selector, { $set: updateQuery });
    });
  }

  /*
   * Save basic info
   */
  static saveBasicInfo(args) {
    return this.saveSection({ ...args, name: 'basicInfo' }, ({ doc, selector }) => {
      this.update(selector, { $set: { basicInfo: doc } });
    });
  }

  /*
   * Common helper that checks previous entry
   */
  static async saveSection(args, updater) {
    const { auditId, supplierId, name, doc } = args;
    const selector = { auditId, supplierId };
    const previousEntry = await this.findOne(selector);

    // update previous entry if exists
    if (previousEntry) {
      await updater({ ...args, selector });

      // return updated
      return this.findOne({ _id: previousEntry._id });
    }

    return this.create({ auditId, supplierId, [name]: doc });
  }
}

AuditReplyRecommendSchema.loadClass(AuditResponse);

const AuditResponses = mongoose.model('audit_responses', AuditReplyRecommendSchema);

export { Audits, AuditResponses };
