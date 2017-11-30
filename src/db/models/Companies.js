import mongoose from 'mongoose';
import { field } from './utils';

// basic info ===========
const BasicInfoSchema = mongoose.Schema(
  {
    enName: field({ type: String }),
    mnName: field({ type: String }),
    isRegisteredOnSup: field({ type: Boolean }),
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
    isSubContractor: field({ type: Boolean }),
    corporateStructure: field({ type: String }),
    registrationNumber: field({ type: Number }),
    email: field({ type: String }),
    foreignOwnershipPercentage: field({ type: Number }),
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

const ManagementTeamSchema = mongoose.Schema(
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
    attachments: [String],
    shareholder1: ShareholderSchema,
    shareholder2: ShareholderSchema,
    shareholder3: ShareholderSchema,
    shareholder4: ShareholderSchema,
    shareholder5: ShareholderSchema,
  },
  { _id: false },
);

// group information =========
const GroupInfoSchema = mongoose.Schema(
  {
    hasParent: field({ type: Boolean }),
    // manufacturer, distributor, stocklist
    role: field({ type: String }),
    isExclusiveDistributor: field({ type: Boolean }),
    attachments: [String],
    primaryManufacturerName: field({ type: String }),
    countryOfPrimaryManufacturer: field({ type: String }),
    shareholders: [ShareholderSchema],
  },
  { _id: false },
);

// capacity building certificate =========
const CertificateInfoSchema = mongoose.Schema(
  {
    isReceived: field({ type: Boolean }),
    isOTSupplier: field({ type: Boolean }),
    cwpo: field({ type: String }),
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

const DatePathSchema = mongoose.Schema(
  {
    date: field({ type: String }),
    path: field({ type: String }),
  },
  { _id: false },
);

const FinancialInfoSchema = mongoose.Schema(
  {
    // Can you provide accounts for the last 3 financial year?
    canProvideAccountsInfo: field({ type: Boolean }),

    currency: field({ type: String }),
    annualTurnover: [YearAmountSchema],
    preTaxProfit: [YearAmountSchema],
    totalAssets: [YearAmountSchema],
    totalCurrentAssets: [YearAmountSchema],
    totalShareholderEquity: [YearAmountSchema],

    canProvideRecordsInfo: [DatePathSchema],

    // Is your company up to date with Social Security payments?
    isUpToDateSSP: field({ type: Boolean }),

    // Is your company up to date with Corporation Tax payments?
    isUpToDateCTP: field({ type: Boolean }),
  },
  { _id: false },
);

// Main schema ============
const CompanySchema = mongoose.Schema({
  basicInfo: BasicInfoSchema,
  contactInfo: ContactInfoSchema,
  managementTeam: ManagementTeamSchema,
  shareholderInfo: ShareholderInfoSchema,
  groupInfo: GroupInfoSchema,
  products: [String],
  certificateInfo: CertificateInfoSchema,
  financialInfo: FinancialInfoSchema,
});

class Company {
  /**
   * Create a company
   * @param  {Object} doc object
   * @return {Promise} Newly created company object
   */
  static async createCompany(basicInfo) {
    const { enName, mnName } = basicInfo;

    await this.checkNames({ enName, mnName });

    return this.create({ basicInfo });
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
    await Companies.update({ _id }, { $set: { basicInfo } });

    return Companies.findOne({ _id });
  }

  /**
   * Update info helper
   */
  static async commonUpdate(_id, key, value) {
    // update
    await Companies.update({ _id }, { $set: { [key]: value } });

    return Companies.findOne({ _id });
  }

  /**
   * Update contact info
   */
  static async updateContactInfo(_id, contactInfo) {
    return this.commonUpdate(_id, 'contactInfo', contactInfo);
  }

  /**
   * Update management team
   */
  static async updateManagementTeam(_id, doc) {
    return this.commonUpdate(_id, 'managementTeam', doc);
  }

  /**
   * Update shareholder info
   */
  static async updateShareholderInfo(_id, shareholderInfo) {
    return this.commonUpdate(_id, 'shareholderInfo', shareholderInfo);
  }

  /**
   * Update group info
   */
  static async updateGroupInfo(_id, groupInfo) {
    return this.commonUpdate(_id, 'groupInfo', groupInfo);
  }

  /**
   * Update products info
   */
  static async updateProductsInfo(_id, products) {
    return this.commonUpdate(_id, 'products', products);
  }

  /**
   * Update certificate info
   */
  static async updateCertificateInfo(_id, certificateInfo) {
    return this.commonUpdate(_id, 'certificateInfo', certificateInfo);
  }

  /**
   * Update financial info
   */
  static async updateFinancialInfo(_id, financialInfo) {
    return this.commonUpdate(_id, 'financialInfo', financialInfo);
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
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
