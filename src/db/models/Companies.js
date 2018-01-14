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
    isRegisteredOnSup: field({ type: Boolean }),
    sapNumber: field({ type: String, optional: true }),
    address: field({ type: String }),
    address2: field({ type: String, optional: true }),
    address3: field({ type: String, optional: true }),
    townOrCity: field({ type: String }),
    province: field({ type: String }),
    zipCode: field({ type: Number }),
    country: field({ type: String }),
    registeredInCountry: field({ type: String }),
    registeredInAimag: field({ type: String }),
    registeredInSum: field({ type: String }),
    isChinese: field({ type: Boolean }),
    isSubContractor: field({ type: Boolean }),
    corporateStructure: field({ type: String }),
    registrationNumber: field({ type: Number }),
    certificateOfRegistration: FileSchema,
    email: field({ type: String }),
    website: field({ type: String, optional: true }),
    foreignOwnershipPercentage: field({ type: String }),
    totalNumberOfEmployees: field({ type: Number }),
    totalNumberOfMongolianEmployees: field({ type: Number }),
    totalNumberOfUmnugoviEmployees: field({ type: Number }),
  },
  { _id: false },
);

// contact info ==================
const ContactInfoSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    jobTitle: field({ type: String }),
    address: field({ type: String }),
    address2: field({ type: String, optional: true }),
    address3: field({ type: String, optional: true }),
    townOrCity: field({ type: String }),
    province: field({ type: String }),
    zipCode: field({ type: Number }),
    country: field({ type: String }),
    phone: field({ type: Number }),
    phone2: field({ type: Number }),
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
    managingDirector: PersonSchema,
    executiveOfficer: PersonSchema,
    salesDirector: PersonSchema,
    financialDirector: PersonSchema,
    otherMember1: PersonSchema,
    otherMember2: PersonSchema,
    otherMember3: PersonSchema,
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
    attachments: [FileSchema],
    shareholders: [ShareholderSchema],
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
    hasParent: field({ type: Boolean }),

    isParentExistingSup: field({ type: Boolean }),

    parentName: field({ type: String }),

    // Ultimate parent company address
    parentAddress: field({ type: String }),

    // Ultimate parent registration number
    parentRegistrationNumber: field({ type: String }),

    // manufacturer, distributor, stocklist
    role: field({ type: String }),

    // Please provide details of the factory or factories involved in the
    // manufacture of this product
    factories: [FactorySchema],

    isExclusiveDistributor: field({ type: Boolean }),
    authorizedDistributions: [String],
    attachments: [FileSchema],
    primaryManufacturerName: field({ type: String }),
    countryOfPrimaryManufacturer: field({ type: String }),
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

    currency: field({ type: String }),
    annualTurnover: [YearAmountSchema],
    preTaxProfit: [YearAmountSchema],
    totalAssets: [YearAmountSchema],
    totalCurrentAssets: [YearAmountSchema],
    totalShareholderEquity: [YearAmountSchema],

    recordsInfo: [DateFileSchema],

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
    doesMeetMinimumStandartsFile: FileSchema,

    // Does the Company have a job description procedure in place?
    doesHaveJobDescription: field({ type: Boolean }),
    doesHaveJobDescriptionFile: FileSchema,

    // Does the company conclude valid contracts with all employees. (include skilled/unskilled,
    // temporary and permanent, and underage workers, etc)
    doesConcludeValidContracts: field({ type: Boolean }),

    // Please provide the employee turnover rate within your company in the last 12 months
    employeeTurnoverRate: field({ type: Number }),

    // Does the organisation have Liability insurance which meets
    // Oyu Tolgoi’s minimum requirements and valid worker compensation insurance or enrolment
    // in an applicable occupational injury/illness insurance programme?
    doesHaveLiabilityInsurance: field({ type: Boolean }),
    doesHaveLiabilityInsuranceFile: FileSchema,

    // Does your company have a documented code of ethics/conduct?
    doesHaveCodeEthics: field({ type: Boolean }),
    doesHaveCodeEthicsFile: FileSchema,

    // Does your company have a documented Corporate Social Responsibility policy?
    doesHaveResponsiblityPolicy: field({ type: Boolean }),
    doesHaveResponsiblityPolicyFile: FileSchema,

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
    proveHasNotConvicted: field({ type: String }),

    // Has your company or any of its directors been investigated or convicted of
    // any other legal infringement not described above within the last five years?
    hasLeadersConvicted: field({ type: Boolean }),

    investigations: [InvestigationSchema],

    // Does your company employ any politically exposed person?
    // If yes, provide list of PEP name
    doesEmployeePoliticallyExposed: field({ type: Boolean }),

    /// Does your company employ any politically exposed person?
    // If yes, provide list of PEP name
    pepName: field({ type: String, optional: true }),

    organizationChartFile: FileSchema,
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
    doesHavePlanFile: FileSchema,

    // Has any environmental regulator inspected / investigated your
    // company within the last 5 years?
    hasEnvironmentalRegulatorInvestigated: field({ type: Boolean }),

    dateOfInvestigation: field({ type: String, optional: true }),

    reasonForInvestigation: field({ type: String, optional: true }),

    actionStatus: field({ type: String, optional: true }),

    investigationDocumentation: FileSchema,

    // Has your company ever been convicted for a breach of any
    // Environmental laws in the countries you operate?
    hasConvictedForEnvironmentalLaws: field({ type: Boolean }),

    // If Yes, what steps have you taken to ensure this does not happen again?
    proveHasNotConvicted: field({ type: String }),
  },
  { _id: false },
);

// Health & safety management system =========

export const HealthInfoSchema = mongoose.Schema(
  {
    // Does the organisation have a Health Safety & Environment management system?
    doesHaveHealthSafety: field({ type: Boolean }),
    doesHaveHealthSafetyFile: FileSchema,

    // Are HSE resources, roles, responsibilities and authority levels clearly
    // identified and defined within your Organisation?
    areHSEResourcesClearlyIdentified: field({ type: Boolean }),

    // Does your company have a documented process to ensure all staff
    // receive health and safety training and induction?
    doesHaveDocumentedProcessToEnsure: field({ type: Boolean }),
    doesHaveDocumentedProcessToEnsureFile: FileSchema,

    // Are all employees under your control required to utilise appropriate
    // Personal Protective Equipment (PPE) at all times?
    areEmployeesUnderYourControl: field({ type: Boolean }),

    //  Does the company have a documented process or guidelines for
    //  risk assessment (including CRM)?
    doesHaveDocumentForRiskAssesment: field({ type: Boolean }),
    doesHaveDocumentForRiskAssesmentFile: FileSchema,

    // Does the company have a documented process for incident investigation?
    doesHaveDocumentForIncidentInvestigation: field({ type: Boolean }),
    doesHaveDocumentForIncidentInvestigationFile: FileSchema,

    // Does your company have a documented Fitness for Work (FFW) policy?
    doesHaveDocumentedFitness: field({ type: Boolean }),
    doesHaveDocumentedFitnessFile: FileSchema,

    // Is your company willing comply with Oyu Tolgoi
    isWillingToComply: field({ type: Boolean }),

    // Has there been any industrial accident in the last 5 financial years ?
    hasIndustrialAccident: field({ type: Boolean }),

    // Provide total man hours
    tmha: field({ type: String }),

    // Provide lost time injury frequency rate
    ltifr: field({ type: String }),

    // Provide a summary explaining the fatality or injury event(s)
    // that contributed to the above
    injuryExplanation: field({ type: String }),

    // Details of how senior management demonstrates its commitment to the
    // oyutolgoi hse policy and management system
    seniorManagement: field({ type: String }),

    // Is your company willing commmit itself
    isWillingToCommit: field({ type: Boolean }),

    // Is your company perpared to compile weekly and monthly safety
    // statistics for the work performed on site ?
    isPerparedToCompile: field({ type: Boolean }),

    // Has your company previously worked on Word bank or international
    // finance corporation project
    hasWorkedOnWorldBank: field({ type: Boolean }),
    hasWorkedOnWorldBankDescription: field({ type: String }),

    // Has your company previously worked on large scale mining construction
    // projects
    hasWorkedOnLargeProjects: field({ type: Boolean }),
    hasWorkedOnLargeProjectsDescription: field({ type: String }),

    // Does the organization have valid industry certificates
    doesHaveLicense: field({ type: Boolean }),
    doesHaveLicenseDescription: field({ type: String }),
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

// Main schema ============
const CompanySchema = mongoose.Schema({
  basicInfo: BasicInfoSchema,
  contactInfo: ContactInfoSchema,
  managementTeamInfo: ManagementTeamInfoSchema,
  shareholderInfo: ShareholderInfoSchema,
  groupInfo: GroupInfoSchema,

  productsInfo: [String],
  validatedProductsInfo: [String],
  isProductsInfoValidated: field({ type: Boolean }),
  productsInfoLastValidatedDate: field({ type: Date }),

  // capacity building certificate information
  certificateInfo: CertificateInfoSchema,

  financialInfo: FinancialInfoSchema,

  // business integrity & human resource
  businessInfo: BusinessInfoSchema,

  // enviromental info
  environmentalInfo: EnvironmentalInfoSchema,

  // health & safety management system
  healthInfo: HealthInfoSchema,

  isPrequalified: field({ type: Boolean }),

  dueDiligences: [DateFileSchema],
  difotScores: [DateAmountSchema],
  averageDifotScore: Number,
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
    return Feedbacks.find({ supplierIds: { $in: [this._id] } }).sort({ createdDate: -1 });
  }

  /*
   * Get get last feedback
   */
  async getLastFeedback() {
    const feedbacks = await this.getFeedbacks();

    return feedbacks.pop();
  }

  /**
   * Create a company
   * @param userId - Permforming user id
   * @return {Promise} Newly created company object
   */
  static async createCompany(userId) {
    const company = await this.create({});

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
  async addDueDiligence(file) {
    const dueDiligences = this.dueDiligences || [];

    dueDiligences.push({ date: new Date(), file });

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
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
