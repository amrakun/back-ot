import moment from 'moment';
import mongoose from 'mongoose';
import { field, StatusPublishClose, isReached } from './utils';
import { Configs, Companies } from './';

const FileSchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Name' }),
    url: field({ type: String, label: 'File url' }),
  },
  { _id: false },
);

// Audit schema
const AuditSchema = mongoose.Schema({
  status: field({ type: String }),

  publishDate: field({ type: Date }),
  closeDate: field({ type: Date }),
  supplierIds: field({ type: [String] }),
  responsibleBuyerIds: field({ type: [String], optional: true, label: 'Responsible buyers' }),
  content: field({ type: String, label: 'Email content' }),

  createdDate: field({ type: Date }),
  createdUserId: field({ type: String }),

  reminderDay: field({ type: Number, optional: true, label: 'Reminder day' }),
});

class Audit extends StatusPublishClose {
  /**
   * Create new audit
   * @param {Object} doc - audit fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created audit object
   */
  static async createAudit(doc, userId) {
    const supplierIds = [];

    for (const supplierId of doc.supplierIds || []) {
      const prevOpenAudit = await AuditResponses.findOne({
        status: 'invited',
        supplierId,
      });

      if (prevOpenAudit) {
        continue;
      }

      supplierIds.push(supplierId);
    }

    if (supplierIds.length === 0) {
      throw new Error('Please choose available suppliers');
    }

    const audit = await this.create({
      ...doc,
      supplierIds,
      status: 'draft',
      createdUserId: userId,
      createdDate: new Date(),
    });

    for (const supplierId of supplierIds) {
      await AuditResponses.createResponse({
        auditId: audit._id,
        supplierId,
        status: 'invited',
        isEditable: false,
        editableDate: audit.closeDate,
        notificationForSupplier: 'invited',
        reminderDay: audit.reminderDay,
      });
    }

    return audit;
  }

  static async getLastAudit(supplierId) {
    const lastAudits = await Audits.find({ supplierIds: { $in: [supplierId] } }).sort({
      createdDate: -1,
    });

    if (lastAudits.length === 0) {
      throw new Error('No audit found');
    }

    const [lastAudit] = lastAudits;

    return lastAudit;
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

    sotieFile: field({ type: FileSchema, optional: true }),

    otExperience: field({ type: String, optional: true }),
  },
  { _id: false },
);

const ReplyRecommendSchema = mongoose.Schema(
  {
    supplierComment: field({ type: String, optional: true }),
    supplierAnswer: field({ type: Boolean, optional: true }),
    supplierFile: field({ type: FileSchema, optional: true }),

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
      labelMn:
        'Танай байгууллага Эрүүл мэнд Аюулгүй Ажиллагаа, Байгаль орчны (ЭМААБО) удирдлагын системтэй юу?',
    }),

    doesHaveDocumentedPolicy: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: 'Does the organization have a documented drug and alcohol policy',
      labelMn:
        'Танай байгууллагад бичиж баримтжуулсан мансууруулах бодис, согтууруулах ундааны тухай бодлого байдаг уу?',
    }),

    doesPerformPreemployment: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation perform pre-employment medical screening, \
        fitness for work evaluations, background checks and verification of \
        competence for employees, contractors and sub-contractors`,
      labelMn:
        'Байгууллага нь ажилд орохоос өмнө ажилтан, гэрээлэгч, туслан гүйцэтгэгч нарыг эмнэлгийн үзлэгт оруулж, эрүүл мэндийн хувьд ажилдаа тэнцэх эсэхийг нь болон тухайн ажилтны өмнөх түүхийг нь урьдчилан шалгаж тогтоодог уу?',
    }),

    doWorkProceduresConform: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Do the organisations work procedures conform to local statutory, \
        legislative or regulatory codes and standards`,
      labelMn:
        'Байгууллагын ажил гүйцэтгэх журмууд нь Монгол улсын хууль эрхзүйн акт, дүрэм, стандартуудтай нийцтэй юу?',
    }),

    doesHaveFormalProcess: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a formal process for HSE induction \
        and orientation of new hire employees, contractors and sub-contractors
      `,
      labelMn:
        'Байгууллагад шинэ ажилтан, гэрээлэгч болон туслан гүйцэтгэгч нарт ЭМААБО-ны танилцуулах сургалт хийдэг албан ёсны үйл явц байгаа юу?',
    }),

    doesHaveTrackingSystem: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a system or process for tracking \
        current employee, contractor and sub-contractor qualifications and \
        competencies`,
      labelMn:
        'Байгууллагад шинэ ажилтан, гэрээлэгч болон туслан гүйцэтгэгч нарт ЭМААБО-ны танилцуулах сургалт хийдэг албан ёсны үйл явц байгаа юу?',
    }),

    doesHaveValidIndustry: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have valid industry certifications \
        and/or licenses if required by the type of services provided`,
      labelMn:
        'Байгууллагад тухайн үйлчилгээг үзүүлэхэд шаардлагатай тухайн салбарын хүчинтэй зөвшөөрөл, гэрчилгээ эсвэл лиценз байгаа юу?',
    }),

    doesHaveFormalProcessForReporting: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a formal process for reporting and \
        investigating incidents (including near-hits/near misses)`,
      labelMn:
        'Байгууллагад осол зөрчлийг (осолд дөхсөн тохиолдлыг оруулан) мэдээлэх, судлан бүртгэх албан ёсны үйл явц бий юу?',
    }),

    doesHaveLiabilityInsurance: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have Liability insurance which meets Oyu \
        Tolgoi’s minimum requirements and valid worker compensation insurance \
        or enrolment in an applicable occupational injury/illness
        insurance programme`,
      labelMn:
        'Байгууллагад "Оюу толгой" ХХК-ийн наад захын шаардлагатай нийцсэн хариуцлагын даатгал тухайлбал ажилтны нөхөн олговор, мэргэжлээс шалтгаалсан өвчин/ гэмтлийн даатгал бүхий даатгалын хөтөлбөр байдаг уу?',
    }),

    // Does the organization have formal process for health safetiy
    // incidents
    doesHaveFormalProcessForHealth: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does the organisation have a formal process for Health Safety \
        and Environmental risk management`,
      labelMn:
        'Танай байгууллагад эрүүл мэнд, аюулгүй ажиллагаа, байгаль орчны эрсдлийн менежментийг хэрэгжүүлдэг албаны ёсны үйл явц, тогтолцоо байдаг уу?',
    }),

    // Special license of importing chemicals and dangerous goods* (subject to scope of work)
    specialLicenseOfImporting: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Special license of importing chemicals and dangerous goods* (subject to scope of work)`,
      labelMn:
        'Химийн болон аюултай хог хаягдал үүсгэх бараа бүтээгдэхүүн импортлох тусгай зөвшөөрөл* (ажлын нэмэлт цар хүрээнээс шалтгаалах) байгаа эсэх?',
    }),

    // Waste management plan on General and Dangerous waste (Policy and principles on segregating, recycling, re-using and disposing of wastes, relevant permits and operational management plans including transporting wastes)
    wasteManagementPlan: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Waste management plan on General and Dangerous waste (Policy and principles on segregating, recycling, re-using and disposing of wastes, relevant permits and operational management plans including transporting wastes)`,
      labelMn:
        'Энгийн болон Аюултай хог хаягдлын менежментийн төлөвлөгөө (бүтээгдэхүүн үйлчилгээнээс үүсэх хог хаягдлаа хэрхэн ангилах, ялгах, дахин боловсруулах, устгах талаар баримтлах бодлого, эрх бүхий байгууллагын зөвшөөрөл, хог хаягдлын тээвэрлэлтийн болон үйл ажиллагааны төлөвлөгөө ) байгаа эсэх?',
    }),
  },
  { _id: false },
);

// human resource management =========

const HrReplyRecommendSchema = mongoose.Schema(
  {
    supplierComment: field({ type: String, optional: true }),
    supplierAnswer: field({ type: Number, optional: true }),
    supplierFile: field({ type: FileSchema, optional: true }),

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
      labelMn: 'Хөдөлмөрийн гэрээ',
    }),

    jobDescriptionProcedure: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Job Description Procedure',
      labelMn: 'Ажлын байрны тодорхойлолт',
    }),

    trainingDevelopment: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Training and Development Policy',
      labelMn: 'Ажилтны сургалт, хөгжлийн бодлого',
    }),

    employeePerformanceManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee Performance Management',
      labelMn: 'Ажилтны гүйцэтгэлийн менежмент',
    }),

    timeKeepingManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Time-Keeping Management',
      labelMn: 'Цаг бүртгэлийн менежмент',
    }),

    managementOfPractises: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Management of Practices related to conduct',
      labelMn: 'Хөдөлмөрийн дотоод журам',
    }),

    managementOfWorkforce: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Management of workforce engagement',
      labelMn: 'Ажилтнуудтай харилцах, мэдээлэл солилцох',
    }),

    employeeAwareness: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee Awareness of their rights to association',
      labelMn: 'Ажилчдын эвлэлдэн нэгдэх, эрх ашигаа хамгаалах эрх',
    }),

    employeeSelection: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee selection and recruitment process',
      labelMn: 'Ажилтан сонгон шалгаруулж ажилд авах',
    }),

    employeeExitManagement: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Employee exit management',
      labelMn: 'Хөдөлмөрийг гэрээг дуусгавар болгох',
    }),

    grievanceAndFairTreatment: field({
      type: HrReplyRecommendSchema,
      optional: true,
      label: 'Grievance and Fair treatment',
      labelMn: 'Гомдол санал гаргах, түүнийг зохистой шийдвэрлэх',
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
      labelMn:
        'Танай компанид бизнесийн ёс зүйтэй холбоотой бичиж баримтжуулсан бодлого эсвэл дагаж мөрдөх дүрэм байдаг уу?',
    }),

    ensureThroughoutCompany: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Are there processes and procedures in place to ensure that your \
        policies or codes of conduct are effectively implemented throughout your company?`,
      labelMn:
        'Танай компанид бодлого, ёс зүйн дүрэм компани даяар үр дүнтэй хэрэгжиж байгаа эсэхийг хянах журам, процесс байдаг уу?',
    }),

    ensureThroughoutSupplyChain: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Are there processes and procedures in place to ensure that your \
        policies or codes of conduct are effectively implemented throughout your Supply Chain`,
      labelMn:
        'Танай бодлого, ёс зүйн дүрэм танай компанийн ханган нийлүүлэгчдийн хүрээнд үр дүнтэй хэрэгжиж байгаа эсэхийг хянах журам, процесс байдаг уу?',
    }),

    haveBeenSubjectToInvestigation: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Has your company been subject to any external investigation \
        regarding corruption within the past five years`,
      labelMn:
        'Танай компани сүүлийн таван жилд авилгатай холбоотой асуудлаар хөндлөнгийн хууль, хяналтын байгууллагаар шалгагдаж байсан уу?',
    }),

    doesHaveDocumentedPolicyToCorruption: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `Does your company have a documented policy in place to prevent corruption`,
      labelMn: 'Танай компанид авилгаас сэргийлэх талаар бичиж баримтжуулсан бодлого бий юу?',
    }),

    whoIsResponsibleForPolicy: field({
      type: ReplyRecommendSchema,
      optional: true,
      label: `If yes to above question, who is responsible person/function for \
        the compliance/anti-corruption program`,
      labelMn:
        'Дээрх асуултанд тийм гэж хариулсан бол ёс зүйн дүрмийн хэрэгжилт болон авилгын эсрэг хөтөлбөрийг ямар хэлтэс эсвэл албан тушаалтан хариуцан ажилладаг вэ?',
    }),
  },
  { _id: false },
);

const ResultFormSchema = mongoose.Schema(
  {
    reportLanguage: field({ type: String }),
    auditDate: field({ type: Date }),
    reassessmentDate: field({ type: Date }),
    reportNo: field({ type: String }),
    auditor: field({ type: String }),
    content: field({ type: String }),
    reminderDay: field({ type: Number, optional: true }),
  },
  { _id: false },
);

const AuditResponseSchema = mongoose.Schema({
  createdDate: field({ type: Date }),
  auditId: field({ type: String }),
  supplierId: field({ type: String }),

  // onTime or late
  status: field({ type: String, optional: true }),

  basicInfo: BasicInfoSchema,
  coreHseqInfo: CoreHseqInfoSchema,
  hrInfo: HrInfoSchema,
  businessInfo: BusinessInfoSchema,

  reminderDay: field({ type: Number, optional: true, label: 'Reminder day' }),

  improvementPlanFile: field({ type: String, optional: true }),
  improvementPlanSentDate: field({ type: Date, optional: true }),

  reportFile: field({ type: String, optional: true }),
  reportSentDate: field({ type: Date, optional: true }),

  isSent: field({ type: Boolean, optional: true }),
  sentDate: field({ type: Date, optional: true }),
  submittedCount: field({ type: Number, optional: true }),

  isEditable: field({ type: Boolean, optional: true }),
  editableDate: field({ type: Date, optional: true }),

  // Using only to track reassesment date notification
  reassessmentDate: field({ type: Date, optional: true }),

  isQualified: field({ type: Boolean, optional: true }),

  // Buyer saved something on this response
  notificationForBuyer: field({ type: String, optional: true }),

  // Supplier saved something on this response
  notificationForSupplier: field({ type: String, optional: true }),

  isSentResubmitRequest: field({ type: Boolean, optional: true }),
  lastResubmitDescription: field({ type: String, optional: true }),

  resultForm: ResultFormSchema,
});

class AuditResponse {
  static createResponse(doc) {
    const now = new Date();

    return this.create({
      createdDate: now,
      ...doc,
    });
  }

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
      return null;
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
  static saveReplyRecommentSection(args, isSupplier) {
    return this.saveSection(
      args,
      async ({ name, doc, selector }) => {
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
      },
      isSupplier,
    );
  }

  static async checkEditable(args) {
    const { auditId, supplierId } = args;

    const response = await this.findOne({ auditId, supplierId });

    if (response && response.isEditable === false) {
      throw new Error('Not editable');
    }
  }

  static async saveResubmitRequest({ description, supplierId }) {
    const lastAudit = await Audits.getLastAudit(supplierId);

    return this.updateOne(
      { auditId: lastAudit._id, supplierId },
      {
        $set: {
          lastResubmitDescription: description,
          isSentResubmitRequest: true,
          notificationForBuyer: 'resubmit request',
        },
      },
    );
  }

  static async toggleState(supplierId, editableDate) {
    const lastAudit = await Audits.getLastAudit(supplierId);

    const oldResponse = await this.findOne({ auditId: lastAudit._id, supplierId });

    const modifier = { isEditable: false };

    // enabling
    if (editableDate) {
      modifier.isEditable = true;
      modifier.editableDate = editableDate;
      modifier.notificationForSupplier = 'enabled';
    }

    await this.update({ _id: oldResponse._id }, { $set: modifier });

    const updatedResponse = await this.findOne({ _id: oldResponse._id });

    return { oldResponse, updatedResponse };
  }

  /*
   * Save basic info
   */
  static async saveBasicInfo(args) {
    await this.checkEditable(args);

    return this.saveSection(
      { ...args, name: 'basicInfo' },
      ({ doc, selector }) => this.update(selector, { $set: { basicInfo: doc } }),
      true,
    );
  }

  /*
   * Common helper that checks previous entry
   */
  static async saveSection(args, updater, isSupplier) {
    const { auditId, supplierId, name, doc } = args;
    const selector = { auditId, supplierId };
    const previousEntry = await this.findOne(selector);

    const supplier = await Companies.getCompany({ _id: supplierId });

    if (!supplier.isSentRegistrationInfo) {
      throw Error('Registration stage is not complete');
    }

    if (!supplier.isSentPrequalificationInfo) {
      throw Error('Prequalification stage is not complete');
    }

    if (!supplier.isPrequalified) {
      throw Error('Not prequalified');
    }

    // update previous entry if exists
    if (previousEntry) {
      await updater({ ...args, selector });

      // updated object
      const response = await this.findOne({ _id: previousEntry._id });

      if (!isSupplier) {
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
      }

      return response;
    }

    return this.create({
      createdDate: new Date(),
      auditId,
      isSent: false,
      supplierId,
      [name]: doc,
    });
  }

  async auditStatus() {
    if (this.status === 'canceled') {
      return 'canceled';
    }

    if (this.isEditable) {
      return 'open';
    }

    const audit = await Audits.findOne({ _id: this.auditId });

    return audit.status;
  }

  /**
   * Mark this response as sent
   * @return - Updated response object
   */
  async send() {
    if (!this.isEditable) {
      throw new Error('Not editable');
    }

    await this.update({
      isSent: true,
      notificationForBuyer: 'sent',
      sentDate: new Date(),
      submittedCount: (this.submittedCount || 0) + 1,
      status: this.isSentResubmitRequest ? 'late' : 'onTime',
      isSentResubmitRequest: false,
    });

    return AuditResponses.findOne({ _id: this._id });
  }

  /**
   * Mark as buyer notified
   * @return - Updated response
   */
  static markAsBuyerNotified(responseId) {
    return AuditResponses.update({ _id: responseId }, { $set: { notificationForBuyer: '' } });
  }

  /**
   * Mark as supplier notified
   * @return - Updated response
   */
  static async markAsSupplierNotified({ auditId, supplierId }) {
    const selector = { auditId, supplierId };

    await AuditResponses.update(selector, { $set: { notificationForSupplier: '' } });

    return AuditResponses.findOne(selector);
  }

  /**
   * Save files & email sent dates for improvement plan, report
   * @param {Boolean} improvementPlan - Is sent improvementPlan email
   * @param {Boolean} report - Is sent report email
   * @return - Updated response
   */
  async sendFiles({ reassessmentDate, reminderDay, improvementPlan, report }) {
    if (improvementPlan) {
      await this.update({ improvementPlanSentDate: new Date() });
    }

    if (report) {
      await this.update({ reportSentDate: new Date() });
    }

    if (reassessmentDate) {
      await this.update({
        isEditable: true,
        reassessmentDate,
        editableDate: reassessmentDate,
        reminderDay,
      });
    }

    return AuditResponses.findOne({ _id: this._id });
  }

  /*
   * Reset supplier's qualification status using config
   * @return - Updated supplier
   */
  static async resetQualification(supplierId) {
    const config = await Configs.getConfig();

    let auditConfig = config.auditDow || {};

    const specific = config.specificAuditDow || {};

    if (specific && specific.supplierIds && specific.supplierIds.includes(supplierId)) {
      auditConfig = specific;
    }

    const { duration, amount } = auditConfig;

    const supplier = await Companies.findOne({ _id: supplierId });

    // ignore not qualified suppliers
    if (!supplier.isQualified) {
      return 'notQualified';
    }

    const qualifiedDate = supplier.qualifiedDate;

    if (moment().diff(qualifiedDate, `${duration}s`) >= amount) {
      await Companies.update(
        { _id: supplierId },
        { $set: { isQualified: false, qualifiedDate: new Date() } },
      );

      return Companies.findOne({ _id: supplierId });
    }

    return 'dueDateIsNotHere';
  }

  /*
   * Get improvement plan duration, amount config for given supplierId
   */
  static async getImprovementPlanConfig(supplierId) {
    const config = await Configs.getConfig();

    let improvementPlanConfig = config.improvementPlanDow || {};

    const specific = config.specificImprovementPlanDow || {};

    if (specific && specific.supplierIds && specific.supplierIds.includes(supplierId)) {
      improvementPlanConfig = specific;
    }

    const supplier = await Companies.findOne({ _id: supplierId });

    return improvementPlanConfig[supplier.tierType];
  }

  /*
   * Notify supplier about improvement plan config and make response editable
   */
  static async notifyImprovementPlan(responseId) {
    const response = await this.findOne({ _id: responseId });
    const supplier = await Companies.findOne({ _id: response.supplierId });
    const config = await this.getImprovementPlanConfig(response.supplierId);

    if (supplier.isQualified) {
      return 'qualified';
    }

    if (!config) {
      return 'notConfigured';
    }

    const { duration, amount } = config;

    const now = new Date();
    const sentDate = response.improvementPlanSentDate;
    const deadline = moment(sentDate).add(amount, `${duration}s`);

    if (moment(deadline).diff(now, 'days') === 14) {
      return this.update(
        { _id: responseId },
        { $set: { isEditable: true, notificationForSupplier: 'improvementPlanDueDate' } },
      );
    }

    return 'dueDateIsNotHere';
  }

  /*
   * Check whether given user is authorized to download given file or not
   * if given file is stored in audit_responses collection
   */
  static async isAuthorizedToDownload(key, user) {
    if (!user.isSupplier) {
      return true;
    }

    const check = async selector => {
      const response = await AuditResponses.findOne(selector);

      if (!response) {
        return false;
      }

      return response.supplierId === user.companyId;
    };

    if (await check({ reportFile: key })) {
      return true;
    }

    if (await check({ improvementPlanFile: key })) {
      return true;
    }
  }

  /*
   * Disable editabled responses
   */
  static async disableEditabledResponses() {
    const editables = await this.find({ isEditable: true });

    const results = [];

    for (let editable of editables) {
      // editable date is reached
      if (isReached(editable.editableDate)) {
        await this.update({ _id: editable._id }, { $set: { isEditable: false } });

        results.push(editable._id);
      }
    }

    return results;
  }

  static async responsesToRemind() {
    const editableResponses = await this.find({
      reminderDay: { $exists: true },
      isEditable: true,
    });

    return editableResponses.filter(response => {
      const editableDate = response.editableDate;
      const remindDate = moment(editableDate)
        .subtract(response.reminderDay, 'days')
        .toDate();
      const now = new Date();

      return (
        now.getFullYear() === remindDate.getFullYear() &&
        now.getMonth() === remindDate.getMonth() &&
        now.getDate() === remindDate.getDate() &&
        now.getHours() === remindDate.getHours() &&
        now.getMinutes() === remindDate.getMinutes()
      );
    });
  }

  qualificationStatusDisplay() {
    if (typeof this.isQualified === 'undefined') {
      return 'In process';
    }

    if (!this.isSent) {
      return 'In process';
    }

    return this.isQualified ? 'Qualified' : 'Not-qualified';
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

  /*
   * Check whether given user is authorized to download given file or not
   * if given file is stored in physical_audits collection
   */
  static async isAuthorizedToDownload(key, user) {
    return !user.isSupplier;
  }
}

PhysicalAuditSchema.loadClass(PhysicalAudit);

const PhysicalAudits = mongoose.model('physical_audits', PhysicalAuditSchema);

export { Audits, AuditResponses, PhysicalAudits };
