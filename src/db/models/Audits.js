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

const ResponseSchema = mongoose.Schema(
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
    doesHaveHealthSafety: ResponseSchema,

    // Does the organization have a documented drug and alcohol policy
    doesHaveDocumentedPolicy: ResponseSchema,

    // Does the organization perform pre employment
    doesPerformPreemployment: ResponseSchema,

    // Do the organizations work procedures conform to local statutory
    doWorkProceduresConform: ResponseSchema,

    // Does the organization have a system or process for tracking
    doesHaveTrackingSystem: ResponseSchema,

    // Does the organization have valid industry
    doesHaveValidIndustry: ResponseSchema,

    // Does the organization have formal process for reporting and investigating
    // incidents
    doesHaveFormalProcessForReporting: ResponseSchema,

    // Does the organization have liability insurance which meets OT's
    // minimum requirements
    doesHaveLiabilityInsurance: ResponseSchema,

    // Does the organization have formal process for health safetiy
    // incidents
    doesHaveFormalProcessForHealth: ResponseSchema,
  },
  { _id: false },
);

// human resource management
const HrInfoSchema = mongoose.Schema(
  {
    workContractManagement: ResponseSchema,
    jobDescriptionProcedure: ResponseSchema,
    trainingDevelopment: ResponseSchema,
    employeePerformanceManagement: ResponseSchema,
    timeKeepingManagement: ResponseSchema,
    managementOfPractises: ResponseSchema,
    managementOfWorkforce: ResponseSchema,
    employeeAwareness: ResponseSchema,
    employeeSelection: ResponseSchema,
    employeeExitManagement: ResponseSchema,
    grievanceAndFairTreatment: ResponseSchema,
  },
  { _id: false },
);

const AuditResponseSchema = mongoose.Schema({
  auditId: field({ type: String }),
  supplierId: field({ type: String }),

  basicInfo: BasicInfoSchema,
  coreHseqInfo: CoreHseqInfoSchema,
  hrInfo: HrInfoSchema,
});

class AuditResponse {
  /**
   * Update common sections that supplier reply then auditor recomment shaped sections
   * like coreHseqInfo
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
  static async updateReplyRecommentSection({ auditId, supplierId, name, doc }) {
    const selector = { auditId, supplierId };
    const previousEntry = await this.findOne(selector);

    // update previous entry if exists
    if (previousEntry) {
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

      // return updated
      return this.findOne({ _id: previousEntry._id });
    }

    return this.create({ auditId, supplierId, [name]: doc });
  }
}

AuditResponseSchema.loadClass(AuditResponse);

const AuditResponses = mongoose.model('audit_responses', AuditResponseSchema);

export { Audits, AuditResponses };
