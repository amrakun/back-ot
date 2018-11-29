import mongoose from 'mongoose';
import { field } from './utils';
import { Users, Feedbacks, BlockedCompanies } from './';

const FileSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
  },
  { _id: false },
);

// basic info ===========
const BasicInfoSchema = mongoose.Schema(
  {
    enName: field({ type: String }),
    mnName: field({ type: String, optional: true }),
    isRegisteredOnSup: field({ type: Boolean, optional: true }),
    sapNumber: field({ type: String, optional: true }),
    address: field({ type: String, optional: true }),
    address2: field({ type: String, optional: true }),
    address3: field({ type: String, optional: true }),
    townOrCity: field({ type: String, optional: true }),
    province: field({ type: String, optional: true }),
    zipCode: field({ type: Number, optional: true }),
    country: field({ type: String, optional: true }),
    registeredInCountry: field({ type: String, optional: true }),
    registeredInAimag: field({ type: String, optional: true }),
    registeredInSum: field({ type: String, optional: true }),
    isChinese: field({ type: Boolean, optional: true }),
    corporateStructure: field({ type: String, optional: true }),
    registrationNumber: field({ type: String, optional: true }),
    certificateOfRegistration: field({ type: FileSchema, optional: true }),
    email: field({ type: String, optional: true }),
    website: field({ type: String, optional: true }),
    foreignOwnershipPercentage: field({ type: String, optional: true }),
    totalNumberOfEmployees: field({ type: Number, optional: true }),
    totalNumberOfMongolianEmployees: field({ type: Number, optional: true }),
    totalNumberOfUmnugoviEmployees: field({ type: Number, optional: true }),
  },
  { _id: false },
);

// contact info ==================
const ContactInfoSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    jobTitle: field({ type: String, optional: true }),
    address: field({ type: String, optional: true }),
    address2: field({ type: String, optional: true }),
    address3: field({ type: String, optional: true }),
    townOrCity: field({ type: String, optional: true }),
    province: field({ type: String, optional: true }),
    zipCode: field({ type: Number, optional: true }),
    country: field({ type: String, optional: true }),
    phone: field({ type: Number }),
    phone2: field({ type: Number, optional: true }),
    email: field({ type: String }),
  },
  { _id: false },
);

// management team ================
const PersonSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    jobTitle: field({ type: String }),
    phone: field({ type: Number }),
    email: field({ type: String }),
  },
  { _id: false },
);

const ManagementTeamInfoSchema = mongoose.Schema(
  {
    managingDirector: field({ type: PersonSchema, optional: true }),
    executiveOfficer: field({ type: PersonSchema, optional: true }),
    salesDirector: field({ type: PersonSchema, optional: true }),
    financialDirector: field({ type: PersonSchema, optional: true }),
    otherMember1: field({ type: PersonSchema, optional: true }),
    otherMember2: field({ type: PersonSchema, optional: true }),
    otherMember3: field({ type: PersonSchema, optional: true }),
  },
  { _id: false },
);

// shareholder information =========
const ShareholderSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    jobTitle: field({ type: String }),
    percentage: field({ type: Number }),
  },
  { _id: false },
);

const ShareholderInfoSchema = mongoose.Schema(
  {
    attachments: field({ type: [FileSchema], optional: true }),
    shareholders: field({ type: [ShareholderSchema], optional: true }),
  },
  { _id: false },
);

// group information =========
const FactorySchema = mongoose.Schema(
  {
    name: field({ type: String }),
    townOrCity: field({ type: String }),
    country: field({ type: String }),
    productCodes: field({ type: [String] }),
  },
  { _id: false },
);

const GroupInfoSchema = mongoose.Schema(
  {
    // Do you have an Ultimate Parent Company?
    hasParent: field({ type: Boolean, optional: true }),

    isParentExistingSup: field({ type: Boolean, optional: true }),

    parentName: field({ type: String, optional: true }),

    // Ultimate parent company address
    parentAddress: field({ type: String, optional: true }),

    // Ultimate parent registration number
    parentRegistrationNumber: field({ type: String, optional: true }),

    // manufacturer, distributor, stocklist
    role: field({ type: [String] }),

    // Please provide details of the factory or factories involved in the
    // manufacture of this product
    factories: field({ type: [FactorySchema], optional: true }),

    isExclusiveDistributor: field({ type: Boolean, optional: true }),
    authorizedDistributions: field({ type: [String], optional: true }),
    attachments: field({ type: [FileSchema], optional: true }),
    primaryManufacturerName: field({ type: String, optional: true }),
    countryOfPrimaryManufacturer: field({ type: String, optional: true }),
  },
  { _id: false },
);

// capacity building certificate =========
const CertificateInfoSchema = mongoose.Schema(
  {
    description: field({ type: String }),
    file: FileSchema,
  },
  { _id: false },
);

// financial information =========
const YearAmountSchema = mongoose.Schema(
  {
    year: field({ type: Number }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

const DateFileSchema = mongoose.Schema(
  {
    date: field({ type: String }),
    file: FileSchema,
  },
  { _id: false },
);

export const FinancialInfoSchema = mongoose.Schema(
  {
    // Can you provide accounts for the last 3 financial year?
    canProvideAccountsInfo: field({ type: Boolean }),

    reasonToCannotNotProvide: field({ type: String, optional: true }),

    currency: field({ type: String, optional: true }),
    annualTurnover: field({ type: [YearAmountSchema], optional: true }),
    preTaxProfit: field({ type: [YearAmountSchema], optional: true }),
    totalAssets: field({ type: [YearAmountSchema], optional: true }),
    totalCurrentAssets: field({ type: [YearAmountSchema], optional: true }),
    totalShareholderEquity: field({ type: [YearAmountSchema], optional: true }),
    recordsInfo: field({ type: [DateFileSchema], optional: true }),

    // Is your company up to date with Social Security payments?
    isUpToDateSSP: field({ type: Boolean, optional: true }),

    // Is your company up to date with Corporation Tax payments?
    isUpToDateCTP: field({ type: Boolean }),
  },
  { _id: false },
);

// Business integrity & human resource =========
const InvestigationSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    date: field({ type: String }),
    status: field({ type: String }),
    statusDate: field({ type: String }),
  },
  { _id: false },
);

export const BusinessInfoSchema = mongoose.Schema(
  {
    // Does your company meet minimum standards of fair employment
    // practice required by Mongolian labor laws and regulations
    doesMeetMinimumStandarts: field({ type: Boolean }),
    doesMeetMinimumStandartsFile: field({ type: FileSchema, optional: true }),

    // Does the Company have a job description procedure in place?
    doesHaveJobDescription: field({ type: Boolean }),
    doesHaveJobDescriptionFile: field({ type: FileSchema, optional: true }),

    // Does the company conclude valid contracts with all employees. (include skilled/unskilled,
    // temporary and permanent, and underage workers, etc)
    doesConcludeValidContracts: field({ type: Boolean }),

    // Please provide the employee turnover rate within your company in the last 12 months
    employeeTurnoverRate: field({ type: Number }),

    // Does the organisation have Liability insurance which meets
    // Oyu Tolgoi’s minimum requirements and valid worker compensation insurance or enrolment
    // in an applicable occupational injury/illness insurance programme?
    doesHaveLiabilityInsurance: field({ type: Boolean }),
    doesHaveLiabilityInsuranceFile: field({ type: FileSchema, optional: true }),

    // Does your company have a documented code of ethics/conduct?
    doesHaveCodeEthics: field({ type: Boolean }),
    doesHaveCodeEthicsFile: field({ type: FileSchema, optional: true }),

    // Does your company have a documented Corporate Social Responsibility policy?
    doesHaveResponsiblityPolicy: field({ type: Boolean }),
    doesHaveResponsiblityPolicyFile: field({ type: FileSchema, optional: true }),

    // Has your company ever been convicted for a breach of any labour
    // laws in the countries you operate within the last five years?
    hasConvictedLabourLaws: field({ type: Boolean }),

    // Has your company ever been convicted for a breach of any human
    // rights in the countries you operate within the last five years?
    hasConvictedForHumanRights: field({ type: Boolean }),

    // Has your company ever been convicted for a breach of any business
    // integrity in the countries you operate within the last five years?
    hasConvictedForBusinessIntegrity: field({ type: Boolean }),

    // If Yes, what steps have you taken to ensure this does not happen again?
    proveHasNotConvicted: field({ type: String, optional: true }),

    // Has your company or any of its directors been investigated or convicted of
    // any other legal infringement not described above within the last five years?
    hasLeadersConvicted: field({ type: Boolean }),

    investigations: field({ type: [InvestigationSchema], optional: true }),

    // Does your company employ any politically exposed person?
    // If yes, provide list of PEP name
    doesEmployeePoliticallyExposed: field({ type: Boolean }),

    /// Does your company employ any politically exposed person?
    // If yes, provide list of PEP name
    pepName: field({ type: String, optional: true }),

    organizationChartFile: field({ type: FileSchema }),

    hasConvictedLabourLawsDescription: field({ type: String, optional: true }),
    hasConvictedForHumanRightsDescription: field({ type: String, optional: true }),

    isSubContractor: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

// Environmental management =========
export const EnvironmentalInfoSchema = mongoose.Schema(
  {
    // Does the organisation have environmental management plans
    // or procedures(including air quality,
    // greenhouse gases emissions, water and contamination prevention,
    // noise and vibration, Waste Management)?
    doesHavePlan: field({ type: Boolean }),
    doesHavePlanFile: field({ type: FileSchema, optional: true }),

    // Has any environmental regulator inspected / investigated your
    // company within the last 5 years?
    hasEnvironmentalRegulatorInvestigated: field({ type: Boolean }),

    dateOfInvestigation: field({ type: String, optional: true }),

    reasonForInvestigation: field({ type: String, optional: true }),

    actionStatus: field({ type: String, optional: true }),

    investigationDocumentation: field({ type: FileSchema, optional: true }),

    // Has your company ever been convicted for a breach of any
    // Environmental laws in the countries you operate?
    hasConvictedForEnvironmentalLaws: field({ type: Boolean }),

    // If Yes, what steps have you taken to ensure this does not happen again?
    proveHasNotConvicted: field({ type: String, optional: true }),
  },
  { _id: false },
);

// Health & safety management system =========

export const HealthInfoSchema = mongoose.Schema(
  {
    // Does the organisation have a Health Safety & Environment management system?
    doesHaveHealthSafety: field({ type: Boolean }),
    doesHaveHealthSafetyFile: field({ type: FileSchema, optional: true }),

    // Are HSE resources, roles, responsibilities and authority levels clearly
    // identified and defined within your Organisation?
    areHSEResourcesClearlyIdentified: field({ type: Boolean }),
    areHSEResourcesClearlyIdentifiedFile: field({ type: FileSchema, optional: true }),

    // Does your company have a documented process to ensure all staff
    // receive health and safety training and induction?
    doesHaveDocumentedProcessToEnsure: field({ type: Boolean }),
    doesHaveDocumentedProcessToEnsureFile: field({ type: FileSchema, optional: true }),

    // Are all employees under your control required to utilise appropriate
    // Personal Protective Equipment (PPE) at all times?
    areEmployeesUnderYourControl: field({ type: Boolean }),
    areEmployeesUnderYourControlFile: field({ type: FileSchema, optional: true }),

    //  Does the company have a documented process or guidelines for
    //  risk assessment (including CRM)?
    doesHaveDocumentForRiskAssesment: field({ type: Boolean }),
    doesHaveDocumentForRiskAssesmentFile: field({ type: FileSchema, optional: true }),

    // Does the company have a documented process for incident investigation?
    doesHaveDocumentForIncidentInvestigation: field({ type: Boolean }),
    doesHaveDocumentForIncidentInvestigationFile: field({ type: FileSchema, optional: true }),

    // Does your company have a documented Fitness for Work (FFW) policy?
    doesHaveDocumentedFitness: field({ type: Boolean }),
    doesHaveDocumentedFitnessFile: field({ type: FileSchema, optional: true }),

    // Is your company willing comply with Oyu Tolgoi
    isWillingToComply: field({ type: Boolean }),

    // Has there been any industrial accident in the last 5 financial years ?
    hasIndustrialAccident: field({ type: Boolean, optional: true }),

    // Provide total man hours
    tmha: field({ type: String, optional: true }),

    // Provide lost time injury frequency rate
    ltifr: field({ type: String, optional: true }),

    // Provide a summary explaining the fatality or injury event(s)
    // that contributed to the above
    injuryExplanation: field({ type: String, optional: true }),

    // Details of how senior management demonstrates its commitment to the
    // oyutolgoi hse policy and management system
    seniorManagement: field({ type: String, optional: true }),

    // Is your company willing commmit itself
    isWillingToCommit: field({ type: Boolean, optional: true }),

    // Is your company perpared to compile weekly and monthly safety
    // statistics for the work performed on site ?
    isPerparedToCompile: field({ type: Boolean, optional: true }),

    // Has your company previously worked on Word bank or international
    // finance corporation project
    hasWorkedOnWorldBank: field({ type: Boolean, optional: true }),
    hasWorkedOnWorldBankDescription: field({ type: String, optional: true }),

    // Has your company previously worked on large scale mining construction
    // projects
    hasWorkedOnLargeProjects: field({ type: Boolean, optional: true }),
    hasWorkedOnLargeProjectsDescription: field({ type: String, optional: true }),

    // Does the organization have valid industry certificates
    doesHaveLicense: field({ type: Boolean, optional: true }),
    doesHaveLicenseDescription: field({ type: String, optional: true }),
  },
  { _id: false },
);

const DateAmountSchema = mongoose.Schema(
  {
    date: field({ type: Date }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

const DueDiligenceSchema = mongoose.Schema(
  {
    date: field({ type: String }),
    file: FileSchema,
    createdUserId: field({ type: String }),
    expireDate: field({ type: String }),
  },
  { _id: false },
);

const ProductsInfoValidation = mongoose.Schema(
  {
    date: field({ type: String }),
    personName: field({ type: String }),
    checkedItems: field({ type: [String] }),
    files: [FileSchema],
    justification: field({ type: String }),
  },
  { _id: false },
);

// Main schema ============
const CompanySchema = mongoose.Schema({
  createdDate: field({ type: Date }),

  basicInfo: field({ type: BasicInfoSchema, optional: true }),
  contactInfo: field({ type: ContactInfoSchema, optional: true }),
  managementTeamInfo: field({ type: ManagementTeamInfoSchema, optional: true }),
  shareholderInfo: field({ type: ShareholderInfoSchema, optional: true }),
  groupInfo: field({ type: GroupInfoSchema, optional: true }),

  tierType: field({
    type: String,
    enum: ['national', 'umnugovi', 'tier1', 'tier2', 'tier3'],
    optional: true,
  }),

  isSentRegistrationInfo: field({ type: Boolean, optional: true, default: false }),

  isSentPrequalificationInfo: field({ type: Boolean, optional: true, default: false }),
  prequalificationSubmittedCount: field({ type: Number, optional: true }),
  isPrequalificationInfoEditable: field({
    type: Boolean,
    optional: true,
    default: true,
  }),

  isSkippedPrequalification: field({ type: Boolean, default: false }),
  prequalificationSkippedReason: field({ type: String, optional: true }),

  isPrequalified: field({ type: Boolean, optional: true }),
  prequalifiedDate: field({ type: Date, optional: true }),

  // capacity building certificate information
  certificateInfo: field({ type: CertificateInfoSchema, optional: true }),

  financialInfo: field({ type: FinancialInfoSchema, optional: true }),

  // business integrity & human resource
  businessInfo: field({ type: BusinessInfoSchema, optional: true }),

  // enviromental info
  environmentalInfo: field({ type: EnvironmentalInfoSchema, optional: true }),

  // health & safety management system
  healthInfo: field({ type: HealthInfoSchema, optional: true }),

  isProductsInfoValidated: field({ type: Boolean, optional: true }),

  isQualified: field({ type: Boolean, optional: true }),
  qualifiedDate: field({ type: Date, optional: true }),

  productsInfo: field({ type: [String], optional: true }),
  validatedProductsInfo: field({ type: [String], optional: true }),

  productsInfoValidations: field({ type: [ProductsInfoValidation], optional: true }),
  dueDiligences: field({ type: [DueDiligenceSchema], optional: true }),
  difotScores: field({ type: [DateAmountSchema], optional: true }),
  averageDifotScore: field({ type: Number, optional: true }),
});

class Company {
  /*
   * Sort by date and get last entry from products info validation
   */
  sortAndGetLast(fieldName) {
    const sorted = (this[fieldName] || []).sort((prev, next) => prev.date > next.date);

    return sorted.pop();
  }

  /*
   * Sort by date and get last entry from products info validation
   */
  getLastProductsInfoValidation() {
    return this.sortAndGetLast('productsInfoValidations');
  }

  /*
   * Sort by date and get last entry from difot scores
   */
  getLastDifotScore() {
    return this.sortAndGetLast('difotScores');
  }

  /*
   * Sort by date and get last entry from dueDilgences
   */
  getLastDueDiligence() {
    return this.sortAndGetLast('dueDiligences');
  }

  /*
   * Get feedbacks that this supplier can see
   */
  getFeedbacks() {
    return Feedbacks.find({ supplierIds: { $in: [this._id] } });
  }

  /*
   * Get get last feedback
   */
  async getLastFeedback() {
    const feedbacks = await this.getFeedbacks().sort({ createdDate: 1 });

    return feedbacks.pop();
  }

  /**
   * Create a company
   * @param userId - Permforming user id
   * @return {Promise} Newly created company object
   */
  static async createCompany(userId, doc = {}) {
    const company = await this.create({
      createdDate: new Date(),
      ...doc,
    });

    // initial difot score is 75%
    await company.addDifotScore(new Date(), 75);

    await Users.update({ _id: userId }, { $set: { companyId: company._id } });

    return company;
  }

  /**
   * Update basic info
   * @param  {String} _id - company id
   * @param  {Object} basicInfo - company basic info
   * @return {Promise} Updated company object
   */
  static async updateBasicInfo(_id, basicInfo) {
    const { enName, mnName } = basicInfo;

    // validations
    await this.checkNames({ _id, enName, mnName });

    // update
    await this.update({ _id }, { $set: { basicInfo } });

    return this.findOne({ _id });
  }

  /**
   * Update sub section info
   * @param {String } _id - Company id
   * @param {String} key - basicInfo, contactInfo etc ...
   * @param {Object} value - related update doc
   * @return Updated company object
   */
  static async updateSection(_id, key, value) {
    const company = await this.findOne({ _id });

    if (value) {
      // is not existing supplier
      if (key === 'basicInfo' && !value.isRegisteredOnSup) {
        value.sapNumber = undefined;
      }

      if (key === 'financialInfo') {
        // if canProvideAccountsInfo is false then below field values must
        // be reseted
        if (!value.canProvideAccountsInfo) {
          value.currency = undefined;
          value.annualTurnover = [];
          value.preTaxProfit = [];
          value.totalAssets = [];
          value.totalCurrentAssets = [];
          value.totalShareholderEquity = [];
          value.recordsInfo = [];
        } else {
          value.reasonToCannotNotProvide = undefined;
        }
      }

      // if hasEnvironmentalRegulatorInvestigated is false then below field
      // values must be reseted
      if (key === 'environmentalInfo') {
        if (!value.hasEnvironmentalRegulatorInvestigated) {
          value.dateOfInvestigation = undefined;
          value.reasonForInvestigation = undefined;
          value.actionStatus = undefined;
          value.investigationDocumentation = undefined;
        }
      }

      // Reseting file field's value back to null after related boolean
      // field's value setted to false
      const fieldNames = Object.keys(value);

      for (const fieldName of fieldNames) {
        if (!fieldName.includes('File')) {
          continue;
        }

        const relatedBoolField = fieldName.replace('File', '');

        if (!fieldNames.includes(relatedBoolField)) {
          continue;
        }

        if (!value[relatedBoolField] && value[fieldName]) {
          value[fieldName] = undefined;
        }
      }
    }

    // update
    await this.update({ _id }, { $set: { [key]: value } });

    // if updating products info then reset validated status
    if (key === 'productsInfo') {
      await this.update(
        { _id },
        {
          $set: {
            isProductsInfoValidated: false,
            validatedProductsInfo: [],
          },
        },
      );
    }

    // prevent disabled prequalification info from editing ========
    const preqTabs = ['financial', 'business', 'environmental', 'health'];
    const editable = company.isPrequalificationInfoEditable;

    if (preqTabs.includes(key.replace('Info', '')) && !editable) {
      throw new Error('Changes disabled');
    }

    return this.findOne({ _id });
  }

  /*
   * Check english and mongolian names duplication
   */
  static async checkNames({ _id, enName, mnName }) {
    if (await this.findOne({ _id: { $ne: _id }, enName: enName })) {
      throw new Error('Duplicated english name');
    }

    if (await this.findOne({ _id: { $ne: _id }, mnName: mnName })) {
      throw new Error('Duplicated mongolian name');
    }
  }

  /*
   * Add new difot score
   * @param {Date} date
   * @param {Number} amount
   * @return updated company
   */
  async addDifotScore(date, amount) {
    const difotScores = this.difotScores || [];

    difotScores.push({ date, amount });

    // calculate average =========
    let totalAmount = 0;

    for (let difotScore of difotScores) {
      totalAmount += difotScore.amount;
    }

    const averageDifotScore = totalAmount / difotScores.length;

    // update fields
    await this.update({ difotScores, averageDifotScore });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Add new due diligence report
   * @param {String} file - File path
   * @return updated company
   */
  async addDueDiligence({ file, expireDate }, user) {
    const dueDiligences = this.dueDiligences || [];

    dueDiligences.push({
      date: new Date(),
      file,
      expireDate,
      createdUserId: user._id,
    });

    // update field
    await this.update({ dueDiligences });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Validate product codes
   * @param [String] codes - Product codes to validate
   * @return updated company
   */
  async validateProductsInfo({ checkedItems, personName, justification, files }) {
    const productsInfo = this.productsInfo || [];
    const productsInfoValidations = this.productsInfoValidations || [];
    const filteredCheckedItems = checkedItems.filter(code => productsInfo.includes(code));

    let validatedProductsInfo = [];
    let isProductsInfoValidated = false;

    if (filteredCheckedItems.length > 0) {
      productsInfoValidations.push({
        date: new Date(),
        checkedItems,
        files,
        personName,
        justification,
      });

      isProductsInfoValidated = filteredCheckedItems.length === productsInfo.length;
      validatedProductsInfo = filteredCheckedItems;
    }

    // update fields
    await this.update({
      productsInfoValidations,
      isProductsInfoValidated,
      validatedProductsInfo,
    });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Mark as sent registration info
   */
  async sendRegistrationInfo() {
    await this.update({ isSentRegistrationInfo: true });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Mark as sent prequalification info
   */
  async sendPrequalificationInfo() {
    await this.update({
      isSentPrequalificationInfo: true,
      isPrequalificationInfoEditable: false,
      prequalificationSubmittedCount: (this.prequalificationSubmittedCount || 0) + 1,
    });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Skip prequalification
   */
  async skipPrequalification(reason) {
    if (this.isPrequalified !== undefined) {
      throw new Error('Invalid action');
    }

    await this.update({
      isSkippedPrequalification: true,
      isSentPrequalificationInfo: true,
      prequalificationSkippedReason: reason,
    });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * toggle prequalification info editable state
   */
  static async togglePrequalificationState(_id) {
    const company = await Companies.findOne({ _id });

    const updateQuery = {
      isPrequalificationInfoEditable: !company.isPrequalificationInfoEditable,
    };

    if (company.isPrequalified) {
      updateQuery.isPrequalified = false;
    }

    await Companies.update({ _id }, { $set: updateQuery, $unset: { isPrequalified: 1 } });

    return Companies.findOne({ _id });
  }

  tierTypeDisplay() {
    switch (this.tierType) {
      case 'tier1':
        return 'Tier 1';

      case 'tier2':
        return 'Tier 2';

      case 'tier3':
        return 'Tier 3';

      case 'national':
        return 'National';

      default:
        return 'Umnugovi';
    }
  }

  prequalificationStatusDisplay() {
    if (typeof this.isPrequalified === 'undefined') {
      return 'In process';
    }

    return this.isPrequalified ? 'Pre-qualified' : 'Not-qualified';
  }

  qualificationStatusDisplay() {
    if (typeof this.isQualified === 'undefined') {
      return 'In process';
    }

    return this.isQualified ? 'Qualified' : 'Not-qualified';
  }

  productsInfoValidationStatusDisplay() {
    if (typeof this.isProductsInfoValidated === 'undefined') {
      return 'In process';
    }

    return this.isProductsInfoValidated ? 'Validated' : 'Not-validated';
  }

  async isBlocked() {
    const isBlocked = await BlockedCompanies.isBlocked(this._id);

    return isBlocked ? 'Blocked' : 'n/a';
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
