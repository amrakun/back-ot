import mongoose from 'mongoose';
import { field, StatusPublishClose } from './utils';
import { Companies } from './';

// Audit schema
const AuditSchema = mongoose.Schema({
  status: field({ type: String }),
  publishDate: field({ type: Date }),
  closeDate: field({ type: Date }),
  supplierIds: field({ type: [String] }),
  createdUserId: field({ type: String }),
});

class Audit extends StatusPublishClose {
  /**
   * Create new audit
   * @param {Object} doc - audit fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created audit object
   */
  static createAudit(doc, userId) {
    return this.create({
      ...doc,
      status: 'draft',
      createdUserId: userId,
    });
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

    otExperience: field({ type: String, optional: true }),
  },
  { _id: false },
);

const ReplyRecommendSchema = mongoose.Schema(
  {
    supplierComment: field({ type: String, optional: true }),
    supplierAnswer: field({ type: Boolean, optional: true }),

    auditorComment: field({ type: String, optional: true }),
    auditorRecommendation: field({ type: String, optional: true }),
    auditorScore: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

// core hseq
export const CoreHseqInfoSchema = mongoose.Schema(
  {
    doesHaveHealthSafety: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: 'Does the organization have a health safety & environment management system',
    }),

    doesHaveDocumentedPolicy: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: 'Does the organization have a documented drug and alcohol policy',
    }),

    doesPerformPreemployment: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation perform pre-employment medical screening, \
        fitness for work evaluations, background checks and verification of \
        competence for employees, contractors and sub-contractors`,
    }),

    doWorkProceduresConform: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Do the organisations work procedures conform to local statutory, \
        legislative or regulatory codes and standards`,
    }),

    doesHaveFormalProcess: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a formal process for HSE induction \
        and orientation of new hire employees, contractors and sub-contractors
      `,
    }),

    doesHaveTrackingSystem: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a system or process for tracking \
        current employee, contractor and sub-contractor qualifications and \
        competencies`,
    }),

    doesHaveValidIndustry: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have valid industry certifications \
        and/or licenses if required by the type of services provided`,
    }),

    doesHaveFormalProcessForReporting: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a formal process for reporting and \
        investigating incidents (including near-hits/near misses)`,
    }),

    doesHaveLiabilityInsurance: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have Liability insurance which meets Oyu \
        Tolgoi’s minimum requirements and valid worker compensation insurance \
        or enrolment in an applicable occupational injury/illness
        insurance programme`,
    }),

    // Does the organization have formal process for health safetiy
    // incidents
    doesHaveFormalProcessForHealth: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a formal process for Health Safety \
        and Environmental risk management`,
    }),
  },
  { _id: false },
);

// human resource management =========

const HrReplyRecommendSchema = mongoose.Schema(
  {
    supplierComment: field({ type: String, optional: true }),
    supplierAnswer: field({ type: Number, optional: true }),

    auditorComment: field({ type: String, optional: true }),
    auditorRecommendation: field({ type: String, optional: true }),
    auditorScore: field({ type: Number, optional: true }),
  },
  { _id: false },
);

export const HrInfoSchema = mongoose.Schema(
  {
    workContractManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Work Contract Management',
    }),

    jobDescriptionProcedure: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Job Description Procedure',
    }),

    trainingDevelopment: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Training and Development Policy',
    }),

    employeePerformanceManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee Performance Management',
    }),

    timeKeepingManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Time-Keeping Management',
    }),

    managementOfPractises: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Management of Practices related to conduct',
    }),

    managementOfWorkforce: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Management of workforce engagement',
    }),

    employeeAwareness: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee Awareness of their rights to association',
    }),

    employeeSelection: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee selection and recruitment process',
    }),

    employeeExitManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee exit management',
    }),

    grievanceAndFairTreatment: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Grievance and Fair treatment',
    }),
  },
  { _id: false },
);

// business integrity info
export const BusinessInfoSchema = mongoose.Schema(
  {
    doesHavePolicyStatement: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does your company have in place a policy statement or code of \
        conduct relating to the Business Integrity and Ethics`,
    }),

    ensureThroughoutCompany: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Are there processes and procedures in place to ensure that your \
        policies or codes of conduct are effectively implemented throughout your company?`,
    }),

    ensureThroughoutSupplyChain: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Are there processes and procedures in place to ensure that your \
        policies or codes of conduct are effectively implemented throughout your Supply Chain`,
    }),

    haveBeenSubjectToInvestigation: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Has your company been subject to any external investigation \
        regarding corruption within the past five years`,
    }),

    doesHaveDocumentedPolicyToCorruption: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does your company have a documented policy in place to prevent corruption`,
    }),

    whoIsResponsibleForPolicy: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `If yes to above question, who is responsible person/function for \
        the compliance/anti-corruption program`,
    }),
  },
  { _id: false },
);

// Evidence info
const EvidenceInfoSchema = mongoose.Schema(
  {
    // Does the organization have a health safety & environmental management
    doesHaveHealthSafety: field({ type: Boolean, optional: true }),

    // Does the organization have a documented drug or alcohol policy
    doesHaveDrugPolicy: field({ type: Boolean, optional: true }),

    // Does the organization perform pre employment
    doesPerformPreemployment: field({ type: Boolean, optional: true }),

    // Do the organizations work procedures conform to local statutory
    workProceduresConform: field({ type: Boolean, optional: true }),

    // Does the organization have a formal process for HSE
    doesHaveFormalProcessForHSE: field({ type: Boolean, optional: true }),

    // Does the organization have a system or process for current employee
    doesHaveSystemForTracking: field({ type: Boolean, optional: true }),

    // Does the organization have valid industry certifictions
    doesHaveValidCertifications: field({ type: Boolean, optional: true }),

    // Does the organization have a process for reporting
    doesHaveSystemForReporting: field({ type: Boolean, optional: true }),

    // Does the organization have liability insurance
    doesHaveLiabilityInsurance: field({ type: Boolean, optional: true }),

    // Does the organization have a formal process for health
    doesHaveFormalProcessForHealth: field({ type: Boolean, optional: true }),

    // Is there a current signed work contract for all types of employees
    isThereCurrentContract: field({ type: Boolean, optional: true }),

    // Does the company have a job description
    doesHaveJobDescription: field({ type: Boolean, optional: true }),

    // Does the company have a training and development policiy
    doesHaveTraining: field({ type: Boolean, optional: true }),

    // is there a procedure related to employee performance
    doesHaveEmployeeRelatedProcedure: field({ type: Boolean, optional: true }),

    // Does the company have time-keeping management
    doesHaveTimeKeeping: field({ type: Boolean, optional: true }),

    // Are there any policies that relate to performance and employee
    // conduct practices
    doesHavePerformancePolicy: field({ type: Boolean, optional: true }),

    // Does the organization have process or framework to support the
    // active engagement
    doesHaveProcessToSupport: field({ type: Boolean, optional: true }),

    // Are employees made aware of their rights
    employeesAwareOfRights: field({ type: Boolean, optional: true }),

    // Does the organization have a system in place to ensure safe work
    // procedures
    doesHaveSystemToEnsureSafeWork: field({ type: Boolean, optional: true }),

    // Are there any policies and procedures related to employee selection
    doesHaveEmployeeSelectionProcedure: field({ type: Boolean, optional: true }),

    // Does the company have a procedure related to employee labor contract
    // termination
    doesHaveEmployeeLaborProcedure: field({ type: Boolean, optional: true }),

    // Does the company have employee grievance/complaint and fair
    // treatment policy
    doesHaveGrievancePolicy: field({ type: Boolean, optional: true }),

    // Are there processes and procedures in place to ensure that your policies
    // or codes of conduct are effectively implemented throughout your company
    proccessToEnsurePolicesCompany: field({ type: Boolean, optional: true }),

    // Are there processes and procedures in place to ensure that your policies
    // or codes of conduct are effectively implemented throughout supply chain
    proccessToEnsurePolicesSupplyChain: field({ type: Boolean, optional: true }),

    // Has your company been subject to any external investigation
    hasBeenSubjectToInvestigation: field({ type: Boolean, optional: true }),

    // Does your company have a documented policy in place to prevent
    // corruption
    doesHaveCorruptionPolicy: field({ type: Boolean, optional: true }),

    // If yes to above question who is responsible person/function for the
    // compliance/anti-corruption program
    whoIsResponsibleForCorruptionPolicy: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

const AuditResponseSchema = mongoose.Schema({
  auditId: field({ type: String }),
  supplierId: field({ type: String }),

  // onTime or late
  status: field({ type: String, optional: true }),

  basicInfo: BasicInfoSchema,
  coreHseqInfo: CoreHseqInfoSchema,
  hrInfo: HrInfoSchema,
  businessInfo: BusinessInfoSchema,
  evidenceInfo: EvidenceInfoSchema,

  improvementPlanFile: field({ type: String, optional: true }),
  improvementPlanSentDate: field({ type: Date, optional: true }),

  reportFile: field({ type: String, optional: true }),
  reportSentDate: field({ type: Date, optional: true }),

  isSent: field({ type: Boolean, optional: true }),
  isQualified: field({ type: Boolean, optional: true }),
});

class AuditResponse {
  /*
   * Check that given section has no invalid answers
   *
   * @param {Object} sectionValue -
      doesHaveHealthSafety: {...},
      doesHaveDocumentedPolicy: {...},
     @param {Object} schema - coreHseqInfo, hrInfo, businessInfo

     @returns Boolean - is Passed;
   */
  static isSectionPassed({ name, schemaValue }) {
    if (!schemaValue) {
      return false;
    }

    const value = schemaValue.toJSON();

    if (Object.keys(value).length === 0) {
      return false;
    }

    // determine schema ================
    let schema = CoreHseqInfoSchema;

    if (name === 'businessInfo') {
      schema = BusinessInfoSchema;
    }

    if (name === 'hrInfo') {
      schema = HrInfoSchema;
    }

    let isPassed = true;

    const paths = schema.paths;

    // doesHaveHealthSafety, doesHaveDocumentedPolicy ...
    const fieldNames = Object.keys(paths);

    for (const fieldName of fieldNames) {
      // supplierComment: comment
      // supplierAnswer: yes
      // auditorComment: comment
      // auditorRecommendation: recommendation
      // auditorScore: no
      const fieldValue = value[fieldName] || {};
      const auditorScore = fieldValue.auditorScore;

      // if auditor replied as no or gave 0 score then consider this
      // supplier as not qualified
      if (!auditorScore) {
        isPassed = false;
        break;
      }
    }

    return isPassed;
  }

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
   * Save evidence info
   */
  static saveEvidenceInfo(args) {
    return this.saveSection({ ...args, name: 'evidenceInfo' }, ({ doc, selector }) => {
      this.update(selector, { $set: { evidenceInfo: doc } });
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

      // updated object
      const response = await this.findOne({ _id: previousEntry._id });

      // check is qualifed ==============
      // All those section's auditorScore field values must be True or greater
      // than 0
      const sections = [
        { name: 'coreHseqInfo', schema: CoreHseqInfoSchema },
        { name: 'businessInfo', schema: BusinessInfoSchema },
        { name: 'hrInfo', schema: HrInfoSchema },
      ];

      let isQualified = true;

      for (let section of sections) {
        const sectionValue = response[section.name];
        const names = Object.keys(section.schema.paths);

        // if section value is empty then ignore rest checks
        if (!sectionValue) {
          isQualified = false;
          break;
        }

        for (let name of names) {
          const fieldValue = sectionValue[name] || {};

          if (!fieldValue.auditorScore) {
            isQualified = false;
          }
        }
      }

      // update supplier's qualified status
      await Companies.update({ _id: supplierId }, { $set: { isQualified } });

      // update response's qualified status
      await this.update(selector, { $set: { isQualified } });

      return response;
    }

    return this.create({ auditId, isSent: false, supplierId, [name]: doc });
  }

  /**
   * Mark this response as sent
   * @return - Updated response object
   */
  async send() {
    if (this.isSent) {
      throw new Error('Already sent');
    }

    let status = 'onTime';

    const audit = await Audits.findOne({ _id: this.auditId });

    // if closeDate is reached, mark status as late
    if (audit.status === 'closed') {
      status = 'late';
    }

    await this.update({ isSent: true, status });

    return AuditResponses.findOne({ _id: this._id });
  }

  /**
   * Save improvement plan, report files & reset dates
   * @param {Boolean} improvementPlanFile - File path
   * @param {Boolean} reportFile - File path
   * @return - Updated response
   */
  async saveFiles({ improvementPlanFile, reportFile }) {
    const doc = {};

    if (improvementPlanFile) {
      doc.improvementPlanFile = improvementPlanFile;
      doc.improvementPlanSentDate = null;
    }

    if (reportFile) {
      doc.reportFile = reportFile;
      doc.reportSentDate = null;
    }

    await this.update(doc);

    return AuditResponses.findOne({ _id: this._id });
  }

  /**
   * Save files & email sent dates for improvement plan, report
   * @param {Boolean} improvementPlan - Is sent improvementPlan email
   * @param {Boolean} report - Is sent report email
   * @return - Updated response
   */
  async sendFiles({ improvementPlan, report }) {
    if (improvementPlan) {
      await this.update({ improvementPlanSentDate: new Date() });
    }

    if (report) {
      await this.update({ reportSentDate: new Date() });
    }

    return AuditResponses.findOne({ _id: this._id });
  }
}

AuditResponseSchema.loadClass(AuditResponse);

const AuditResponses = mongoose.model('audit_responses', AuditResponseSchema);

// Physical audit schema
const PhysicalAuditSchema = mongoose.Schema({
  createdDate: field({ type: Date }),
  createdUserId: field({ type: String }),
  isQualified: field({ type: Boolean }),
  supplierId: field({ type: String }),
  reportFile: field({ type: String }),
  improvementPlanFile: field({ type: String }),
});

class PhysicalAudit {
  /**
   * Create new physical audit
   * @param {Object} doc - audit fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created physical audit object
   */
  static async createPhysicalAudit(doc, userId) {
    const audit = await this.create({
      ...doc,
      createdDate: new Date(),
      createdUserId: userId,
    });

    await this.updateSupplierInfo(doc.supplierId, doc.isQualified);

    return audit;
  }

  /**
   * Update existing physical audit
   * @param {Object} doc - audit fields
   * @return {Promise} updated physical audit object
   */
  static async updatePhysicalAudit(_id, doc) {
    await this.update({ _id }, { $set: doc });

    await this.updateSupplierInfo(doc.supplierId, doc.isQualified);

    return this.findOne({ _id });
  }

  /*
   * Update supplier's isQualified field
   */
  static updateSupplierInfo(supplierId, isQualified) {
    return Companies.update({ _id: supplierId }, { $set: { isQualified } });
  }

  /**
   * Remove existing physical audit
   */
  static removePhysicalAudit(_id) {
    return this.remove({ _id });
  }
}

PhysicalAuditSchema.loadClass(PhysicalAudit);

const PhysicalAudits = mongoose.model('physical_audits', PhysicalAuditSchema);

export { Audits, AuditResponses, PhysicalAudits };
