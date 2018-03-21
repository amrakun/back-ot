import mongoose from 'mongoose';
import { field } from './utils';
import { Users, Feedbacks } from './';

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
    registrationNumber: field({ type: Number, optional: true }),
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
    isReceived: field({ type: Boolean }),
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

    reasonToCannotNotProvide: field({ type: String }),

    currency: field({ type: String, optional: true }),
    annualTurnover: field({ type: [YearAmountSchema], optional: true }),
    preTaxProfit: field({ type: [YearAmountSchema], optional: true }),
    totalAssets: field({ type: [YearAmountSchema], optional: true }),
    totalCurrentAssets: field({ type: [YearAmountSchema], optional: true }),
    totalShareholderEquity: field({ type: [YearAmountSchema], optional: true }),

    recordsInfo: field({ type: [DateFileSchema], optional: true }),

    // Is your company up to date with Social Security payments?
    isUpToDateSSP: field({ type: Boolean }),

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

const DueDiligencSchema = mongoose.Schema(
  {
    date: field({ type: String }),
    file: FileSchema,
    expireDate: field({ type: String }),
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

  productsInfo: field({ type: [String], optional: true }),
  validatedProductsInfo: field({ type: [String], optional: true }),
  isProductsInfoValidated: field({ type: Boolean, optional: true }),
  productsInfoLastValidatedDate: field({ type: Date, optional: true }),

  tierType: field({ type: String, optional: true }),

  isSentRegistrationInfo: field({ type: Boolean, optional: true, default: false }),
  isSentPrequalificationInfo: field({ type: Boolean, optional: true, default: false }),

  // capacity building certificate information
  certificateInfo: field({ type: CertificateInfoSchema, optional: true }),

  financialInfo: field({ type: FinancialInfoSchema, optional: true }),

  // business integrity & human resource
  businessInfo: field({ type: BusinessInfoSchema, optional: true }),

  // enviromental info
  environmentalInfo: field({ type: EnvironmentalInfoSchema, optional: true }),

  // health & safety management system
  healthInfo: field({ type: HealthInfoSchema, optional: true }),

  isPrequalified: field({ type: Boolean, optional: true }),
  prequalifiedDate: field({ type: Date, optional: true }),
  isQualified: field({ type: Boolean, optional: true }),

  dueDiligences: field({ type: [DueDiligencSchema], optional: true }),
  difotScores: field({ type: [DateAmountSchema], optional: true }),
  averageDifotScore: field({ type: Number, optional: true }),
});

class Company {
  /*
   * Sort by date and get last entry from difot scores
   */
  getLastDifotScore() {
    const sortedDifotScores = (this.difotScores || []).sort((prev, next) => prev.date > next.date);

    return sortedDifotScores.pop();
  }

  /*
   * Sort by date and get last entry from dueDilgences
   */
  getLastDueDiligence() {
    const sortedDueDiligences = (this.dueDiligences || []).sort(
      (prev, next) => prev.date > next.date,
    );

    return sortedDueDiligences.pop();
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
    // update
    await this.update({ _id }, { $set: { [key]: value } });

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
  async addDueDiligence({ file, expireDate }) {
    const dueDiligences = this.dueDiligences || [];

    dueDiligences.push({ date: new Date(), file, expireDate });

    // update field
    await this.update({ dueDiligences });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Validate product codes
   * @param [String] codes - Product codes to validate
   * @return updated company
   */
  async validateProductsInfo(codes) {
    const productsInfo = this.productsInfo || [];
    const validatedProductsInfo = [];

    let isProductsInfoValidated = false;

    codes.forEach(code => {
      // check duplicate & valid
      if (!validatedProductsInfo.includes(code) && productsInfo.includes(code)) {
        validatedProductsInfo.push(code);

        // mark as validated
        isProductsInfoValidated = true;
      }
    });

    // update fields
    await this.update({
      validatedProductsInfo,
      isProductsInfoValidated,
      productsInfoLastValidatedDate: new Date(),
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
    await this.update({ isSentPrequalificationInfo: true });

    return Companies.findOne({ _id: this._id });
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
