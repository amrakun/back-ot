import mongoose from 'mongoose';
import { field } from './utils';
import { Users, Feedbacks, BlockedCompanies } from './';
import {
  TIER_TYPES,
  addressFieldNames,
  shareholderFieldNames,
  personFieldNames,
  groupInfoFieldNames,
} from './constants';

const FileSchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Name' }),
    url: field({ type: String, label: 'File url' }),
  },
  { _id: false },
);

// basic info ===========
const BasicInfoSchema = mongoose.Schema(
  {
    enName: field({
      type: String,
      label: 'Company name (in English alphabet only)',
    }),
    mnName: field({
      type: String,
      optional: true,
      label: 'Company name (cyrillic only)',
    }),
    isRegisteredOnSup: field({
      type: Boolean,
      optional: true,
      label: 'Is registered on supplier',
    }),
    sapNumber: field({
      type: String,
      optional: true,
      label: 'Vendor number',
    }),
    address: field({ type: String, optional: true, label: 'Address line' }),
    address2: field({
      type: String,
      optional: true,
      label: 'Address line 2 / Soum',
    }),
    address3: field({ type: String, optional: true, label: 'Address line 3' }),
    townOrCity: field({
      type: String,
      optional: true,
      label: 'Town/City/Aimag',
    }),
    province: field({
      type: String,
      optional: true,
      label: 'State/Province',
    }),
    zipCode: field({
      type: Number,
      optional: true,
      label: 'Postcode or zipcode',
    }),
    country: field({ type: String, optional: true, label: 'Country' }),
    registeredInCountry: field({
      type: String,
      optional: true,
      label: 'Country you are registered in',
    }),
    registeredInAimag: field({
      type: String,
      optional: true,
      label: 'City/Aimag you are registered in',
    }),
    registeredInSum: field({
      type: String,
      optional: true,
      label: 'Sum/duureg you are registered in',
    }),
    isChinese: field({
      type: Boolean,
      optional: true,
      label: 'Is Chinese',
    }),
    corporateStructure: field({
      type: String,
      optional: true,
      label: 'Business type',
    }),
    registrationNumber: field({
      type: String,
      optional: true,
      label: 'Company registration number',
    }),
    certificateOfRegistration: field({
      type: FileSchema,
      optional: true,
      label: 'Certificate of registration',
    }),
    email: field({
      type: String,
      optional: true,
      label: 'Company email',
    }),
    website: field({
      type: String,
      optional: true,
      label: 'Company website',
    }),
    foreignOwnershipPercentage: field({
      type: String,
      optional: true,
      label: 'Please indicate what percentage of company is owned by foreign entity',
    }),
    totalNumberOfEmployees: field({
      type: Number,
      optional: true,
      label: 'Total number of employees',
    }),
    totalNumberOfMongolianEmployees: field({
      type: Number,
      optional: true,
      label: 'Total number of Mongolian employees',
    }),
    totalNumberOfUmnugoviEmployees: field({
      type: Number,
      optional: true,
      label: 'Total number of Umnugovi employees',
    }),
  },
  { _id: false },
);

// contact info ==================
const ContactInfoSchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Full name' }),
    jobTitle: field({ type: String, optional: true, label: 'Job title' }),
    address: field({ type: String, optional: true, label: 'Address line' }),
    address2: field({ type: String, optional: true, label: 'Address line 2 / Soum' }),
    address3: field({ type: String, optional: true, label: 'Address line 3' }),
    townOrCity: field({ type: String, optional: true, label: 'Town/City/Aimag' }),
    province: field({ type: String, optional: true, label: 'State/Province' }),
    zipCode: field({ type: Number, optional: true, label: 'Postal code or zip code' }),
    country: field({ type: String, optional: true, label: 'Country' }),
    phone: field({ type: Number, label: 'Phone' }),
    phone2: field({ type: Number, optional: true, label: 'Phone 2' }),
    email: field({ type: String, label: 'E-mail' }),
  },
  { _id: false },
);

// management team ================
const PersonSchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Full name' }),
    jobTitle: field({ type: String, label: 'Job title' }),
    phone: field({ type: Number, label: 'Phone' }),
    email: field({ type: String, label: 'E-mail' }),
  },
  { _id: false },
);

const ManagementTeamInfoSchema = mongoose.Schema(
  {
    managingDirector: field({ type: PersonSchema, optional: true, label: 'Managing director' }),
    executiveOfficer: field({ type: PersonSchema, optional: true, label: 'Executive officer' }),
    salesDirector: field({ type: PersonSchema, optional: true, label: 'Sales director' }),
    financialDirector: field({ type: PersonSchema, optional: true, label: 'Financial director' }),
    otherMember1: field({
      type: PersonSchema,
      optional: true,
      label: 'Other management team member',
    }),
    otherMember2: field({
      type: PersonSchema,
      optional: true,
      label: 'Other management team member 2',
    }),
    otherMember3: field({
      type: PersonSchema,
      optional: true,
      label: 'Other management team member 3',
    }),
  },
  { _id: false },
);

// shareholder information =========
const ShareholderSchema = mongoose.Schema(
  {
    type: field({ type: String, label: 'Type' }),
    firstName: field({ type: String, label: 'First name' }),
    lastName: field({ type: String, label: 'Last name' }),
    jobTitle: field({ type: String, label: 'Job title' }),
    companyName: field({ type: String, label: 'Company name' }),
    percentage: field({ type: Number, label: 'Share percentage (%)' }),
  },
  { _id: false },
);

const ShareholderInfoSchema = mongoose.Schema(
  {
    attachments: field({
      type: [FileSchema],
      optional: true,
      label: 'Please provide key shareholders information',
    }),
    shareholders: field({ type: [ShareholderSchema], optional: true, label: 'Shareholders' }),
  },
  { _id: false },
);

// group information =========
const FactorySchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Factory name' }),
    townOrCity: field({ type: String, label: 'Town or city' }),
    country: field({ type: String, label: 'Country' }),
    productCodes: field({ type: [String], label: 'Product codes' }),
  },
  { _id: false },
);

const GroupInfoSchema = mongoose.Schema(
  {
    hasParent: field({
      type: Boolean,
      optional: true,
      label: 'Do you have an Ultimate Parent Company?',
    }),

    isParentExistingSup: field({
      type: Boolean,
      optional: true,
      label: 'Is your parent company existing supplier in OT?',
    }),

    parentName: field({ type: String, optional: true, label: 'Ultimate parent company' }),

    parentAddress: field({
      type: String,
      optional: true,
      label: 'Ultimate parent company address',
    }),

    parentRegistrationNumber: field({
      type: String,
      optional: true,
      label: 'Ultimate parent registration number',
    }),

    // manufacturer, distributor, stocklist
    role: field({
      type: [String],
      label: 'Are you a Manufacturer, Distributor or Service Provider?',
    }),

    // Please provide details of the factory or factories involved in the
    // manufacture of this product
    factories: field({ type: [FactorySchema], optional: true, label: 'Factories' }),

    isExclusiveDistributor: field({
      type: Boolean,
      optional: true,
      label: 'Are you an exclusive distributor?',
    }),
    authorizedDistributions: field({
      type: [String],
      optional: true,
      label: 'Please list names of authorized distribution rights /EOM/',
    }),
    attachments: field({
      type: [FileSchema],
      optional: true,
      label: 'Please upload your authorized distribution rights files',
    }),
    primaryManufacturerName: field({
      type: String,
      optional: true,
      label: 'Primary manufacturer name',
    }),
    countryOfPrimaryManufacturer: field({
      type: String,
      optional: true,
      label: 'Country of primary manufacturer',
    }),
  },
  { _id: false },
);

// capacity building certificate =========
const CertificateInfoSchema = mongoose.Schema(
  {
    description: field({ type: String, label: 'Description' }),
    file: field({ type: FileSchema, label: 'Certificate file', optional: true }),
  },
  { _id: false },
);

// financial information =========
const YearAmountSchema = mongoose.Schema(
  {
    year: field({ type: Number, label: 'Year' }),
    amount: field({ type: Number, label: 'Amount' }),
  },
  { _id: false },
);

const DateFileSchema = mongoose.Schema(
  {
    date: field({ type: String, label: 'Date' }),
    file: FileSchema,
  },
  { _id: false },
);

export const FinancialInfoSchema = mongoose.Schema(
  {
    canProvideAccountsInfo: field({
      type: Boolean,
      label: 'Can you provide accounts for the last 3 financial years?',
    }),

    reasonToCannotNotProvide: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Reasons to not provide accounts for the last 3 financial years',
    }),

    currency: field({ type: String, optional: true, label: 'Currency' }),
    annualTurnover: field({ type: [YearAmountSchema], optional: true, label: 'Sales revenue' }),
    preTaxProfit: field({
      type: [YearAmountSchema],
      optional: true,
      label: 'Net income before tax',
    }),
    totalAssets: field({ type: [YearAmountSchema], optional: true, label: 'Total assets' }),
    totalCurrentAssets: field({
      type: [YearAmountSchema],
      optional: true,
      label: 'Total current assets',
    }),
    totalShareholderEquity: field({
      type: [YearAmountSchema],
      optional: true,
      label: 'Total shareholders equity',
    }),
    recordsInfo: field({
      type: [DateFileSchema],
      optional: true,
      label: 'Please provide financial records for your last 3 years',
    }),

    isUpToDateSSP: field({
      type: Boolean,
      optional: true,
      label: 'Is your company up to date with Social Security payments?',
    }),

    isUpToDateCTP: field({
      type: Boolean,
      label: 'Is your company up to date with Corporation Tax payments?',
    }),
  },
  { _id: false },
);

// Business integrity & human resource =========
const InvestigationSchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Name' }),
    date: field({ type: String, label: 'Date' }),
    status: field({ type: String, label: 'Status' }),
    statusDate: field({ type: String, label: 'Status date' }),
  },
  { _id: false },
);

export const BusinessInfoSchema = mongoose.Schema(
  {
    doesMeetMinimumStandarts: field({
      type: Boolean,
      label: `
        Does your company meet minimum standards of fair employment practice required by Mongolian 
        labor laws and regulations
      `,
    }),
    doesMeetMinimumStandartsFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Minimum standards of fair employment practice supporting document',
    }),

    doesHaveJobDescription: field({
      type: Boolean,
      label: 'Does the Company have a job description procedure in place?',
    }),
    doesHaveJobDescriptionFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Job description procedure supporting document',
    }),

    doesConcludeValidContracts: field({
      type: Boolean,
      label: `
        Does the company conclude valid contracts with all employees. 
        (include skilled/unskilled, temporary and permanent, and underage workers, etc)
      `,
    }),
    doesConcludeValidContractsFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Valid contracts with employees supporting document',
    }),

    employeeTurnoverRate: field({
      type: Number,
      label: 'Please provide the employee turnover rate within your company in the last 12 months',
    }),

    doesHaveLiabilityInsurance: field({
      type: Boolean,
      label: `
        Does the organisation have Liability insurance which meets Oyu Tolgoi’s minimum 
        requirements and valid worker compensation insurance or enrolment in an 
        applicable occupational injury/illness insurance programme?`,
    }),
    doesHaveLiabilityInsuranceFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Liability insurance supporting document',
    }),

    doesHaveCodeEthics: field({
      type: Boolean,
      label: 'Does your company have a documented code of ethics/conduct?',
    }),
    doesHaveCodeEthicsFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Code of ethics/conduct supporting document',
    }),

    doesHaveResponsiblityPolicy: field({
      type: Boolean,
      label: 'Does your company have a documented Corporate Social Responsibility policy?',
    }),
    doesHaveResponsiblityPolicyFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Corporate social responsibility policy supporting document',
    }),

    hasConvictedLabourLaws: field({
      type: Boolean,
      label: `
        Has your company ever been convicted for a breach of any labour laws 
        in the countries you operate within the last five years?
      `,
    }),

    hasConvictedForHumanRights: field({
      type: Boolean,
      label: `
        Has your company ever been convicted for a breach of any human rights 
        in the countries you operate within the last five years?
      `,
    }),

    hasConvictedForBusinessIntegrity: field({
      type: Boolean,
      label: `
        Has your company ever been convicted for a breach of any business integrity 
        in the countries you operate within the last five years?
      `,
    }),

    proveHasNotConvicted: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'If Yes, what steps have you taken to ensure this does not happen again?',
    }),

    hasLeadersConvicted: field({
      type: Boolean,
      label: `
        Has your company or any of its directors been investigated or convicted 
        of any other legal infringement not described above within the last five years?
      `,
    }),

    investigations: field({ type: [InvestigationSchema], optional: true, label: 'Investigations' }),

    doesEmployeePoliticallyExposed: field({
      type: Boolean,
      label:
        'Does your company employ any politically exposed person? If yes, provide list of PEP name',
    }),

    pepName: field({
      type: String,
      optional: true,
      qualifiable: false,
      label:
        'Does your company employ any politically exposed person? If yes, provide list of PEP name',
    }),

    organizationChartFile: field({
      type: FileSchema,
      label: 'Please upload copy of your organisation chart',
    }),

    hasConvictedLabourLawsDescription: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Labour laws conviction description',
    }),
    hasConvictedForHumanRightsDescription: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Humans rights conviction description',
    }),

    isSubContractor: field({
      type: Boolean,
      optional: true,
      label: `
        Does your company, parent company or any sub-contractor is registered in any 
        of the following countries to which international trade sanctions apply
      `,
    }),
  },
  { _id: false },
);

// Environmental management =========
export const EnvironmentalInfoSchema = mongoose.Schema(
  {
    doesHavePlan: field({
      type: Boolean,
      label: `
        Does the organisation have environmental management plans or procedures 
        (including air quality, greenhouse gases emissions, water and contamination prevention, 
        noise and vibration, Waste Management)?
      `,
    }),
    doesHavePlanFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Environmental management plan file',
    }),

    hasEnvironmentalRegulatorInvestigated: field({
      type: Boolean,
      label: `
        Has any environmental regulator inspected / investigated 
        your company within the last 5 years?
      `,
    }),

    dateOfInvestigation: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Date of Inspection / Investigation',
    }),

    reasonForInvestigation: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Reasons for investigation/inspection',
    }),

    actionStatus: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Action status',
    }),

    investigationDocumentation: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Inspection / Investigation Documentation',
    }),

    hasConvictedForEnvironmentalLaws: field({
      type: Boolean,
      label: `
        Has your company ever been convicted for a breach of any Environmental laws 
        in the countries you operate?
      `,
    }),

    // If Yes, what steps have you taken to ensure this does not happen again?
    proveHasNotConvicted: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Steps taken regarding breach of environmental laws',
    }),
  },
  { _id: false },
);

// Health & safety management system =========
export const HealthInfoSchema = mongoose.Schema(
  {
    doesHaveHealthSafety: field({
      type: Boolean,
      label: 'Does the organisation have a Health Safety & Environment management system?',
    }),
    doesHaveHealthSafetyFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Health safety & Environment management system supporting document ',
    }),

    areHSEResourcesClearlyIdentified: field({
      type: Boolean,
      label: `
        Are HSE resources, roles, responsibilities and authority levels clearly identified 
        and defined within your Organisation?
      `,
    }),
    areHSEResourcesClearlyIdentifiedFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'HSE resources, roles, responsibilities and authority level definition document',
    }),

    doesHaveDocumentedProcessToEnsure: field({
      type: Boolean,
      label: `
        Does your company have a documented process to ensure all staff receive 
        health and safety training and induction?
      `,
    }),
    doesHaveDocumentedProcessToEnsureFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Health and safety training induction document',
    }),

    areEmployeesUnderYourControl: field({
      type: Boolean,
      label: `
        Are all employees under your control required to utilise appropriate Personal Protective 
        Equipment (PPE) at all times?
      `,
    }),
    areEmployeesUnderYourControlFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Employees required to utilise appropriate PPE supporting document',
    }),

    doesHaveDocumentForRiskAssesment: field({
      type: Boolean,
      label: `
        Does the company have a documented process or guidelines for 
        risk assessment (including CRM)?
      `,
    }),
    doesHaveDocumentForRiskAssesmentFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Risk assessment document',
    }),

    doesHaveDocumentForIncidentInvestigation: field({
      type: Boolean,
      label: 'Does the company have a documented process for incident investigation?',
    }),
    doesHaveDocumentForIncidentInvestigationFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Incident investigation document',
    }),

    doesHaveDocumentedFitness: field({
      type: Boolean,
      label: 'Does your company have a documented Fitness for Work (FFW) policy?',
    }),
    doesHaveDocumentedFitnessFile: field({
      type: FileSchema,
      optional: true,
      qualifiable: false,
      label: 'Fitness for Work policy document',
    }),

    isWillingToComply: field({
      type: Boolean,
      label: 'Is your company willing comply with Oyu Tolgoi',
    }),

    hasIndustrialAccident: field({
      type: Boolean,
      optional: true,
      label: 'Has there been any industrial accident?',
    }),

    tmha: field({
      type: String,
      optional: true,
      label: `
        Provide total man hours accrued for the previous five calendar years for 
        all onsite personnel on Contractor managed projects
      `,
    }),

    ltifr: field({
      type: String,
      optional: true,
      label: 'Provide lost time injury frequency rate',
    }),

    injuryExplanation: field({
      type: String,
      optional: true,
      label: `
        Provide a summary explaining the fatality or injury event(s) that contributed to the above
      `,
    }),

    seniorManagement: field({
      type: String,
      optional: true,
      label: `
        Details of how senior management demonstrates its commitment to the oyutolgoi 
        hse policy and management system
      `,
    }),

    isWillingToCommit: field({
      type: Boolean,
      optional: true,
      label: `
        Is your company willing to commit itself, its employees and all Sub-contractors, 
        to implementing and being held to KPIs relating to critical risk management (CRM)?
      `,
    }),

    isPerparedToCompile: field({
      type: Boolean,
      optional: true,
      label: `
        Is your company prepared to compile weekly and monthly safety statistics for 
        the work performed on Site?
      `,
    }),

    hasWorkedOnWorldBank: field({
      type: Boolean,
      optional: true,
      label: `
        Has your company previously worked on World bank or international 
        finance corporation project?
      `,
    }),
    hasWorkedOnWorldBankDescription: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'World bank or international finance corporation project related description',
    }),

    hasWorkedOnLargeProjects: field({
      type: Boolean,
      optional: true,
      label: 'Has your company previously worked on large scale mining construction projects',
    }),
    hasWorkedOnLargeProjectsDescription: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Large scale mining construction project work experience description',
    }),

    doesHaveLicense: field({
      type: Boolean,
      optional: true,
      label: `
        Does the organisation have valid industry certifications and/or licenses 
        if required by the type of services provided?
      `,
    }),
    doesHaveLicenseDescription: field({
      type: String,
      optional: true,
      qualifiable: false,
      label: 'Valid industry certification or license description',
    }),
  },
  { _id: false },
);

const DateAmountSchema = mongoose.Schema(
  {
    date: field({ type: Date, label: 'Date' }),
    amount: field({ type: Number, label: 'Amount' }),
  },
  { _id: false },
);

const DueDiligenceSchema = mongoose.Schema(
  {
    date: field({ type: String, label: 'Date' }),
    file: field({ type: FileSchema, label: 'File', optional: true }),
    createdUserId: field({ type: String, label: 'Created user' }),
    expireDate: field({ type: String, label: 'Expire date' }),
  },
  { _id: false },
);

const ProductsInfoValidation = mongoose.Schema(
  {
    date: field({ type: String, label: 'Date' }),
    personName: field({ type: String, label: 'Validated person name' }),
    checkedItems: field({ type: [String], label: 'Checked items' }),
    files: field({ type: [FileSchema], label: 'Supporting documents', optional: true }),
    justification: field({ type: String, label: 'Justification' }),
  },
  { _id: false },
);

const generateFields = names => {
  const definitions = {};

  for (let name of names) {
    definitions[name] = field({
      type: String,
      optional: true,
    });
  }

  return mongoose.Schema(definitions, { _id: false });
};

const RecommendationSchema = mongoose.Schema(
  {
    basicInfo: generateFields(addressFieldNames),
    shareholderInfo: {
      shareholders: [generateFields(shareholderFieldNames)],
    },
    managementTeamInfo: {
      managingDirector: generateFields(personFieldNames),
      executiveOfficer: generateFields(personFieldNames),
    },
    groupInfo: generateFields(groupInfoFieldNames),
  },
  { _id: false },
);

// Main schema ============
const CompanySchema = mongoose.Schema({
  createdDate: field({ type: Date, index: true }),

  basicInfo: field({
    type: BasicInfoSchema,
    optional: true,
    label: 'Company information',
  }),
  contactInfo: field({ type: ContactInfoSchema, optional: true, label: 'Contact details' }),
  managementTeamInfo: field({
    type: ManagementTeamInfoSchema,
    optional: true,
    label: 'Management team',
  }),
  shareholderInfo: field({
    type: ShareholderInfoSchema,
    optional: true,
    label: 'Company shareholder information',
  }),
  groupInfo: field({ type: GroupInfoSchema, optional: true, label: 'Group information' }),

  tierType: field({
    type: String,
    enum: TIER_TYPES,
    optional: true,
    label: 'Tier type',
  }),

  isSentRegistrationInfo: field({
    type: Boolean,
    optional: true,
    default: false,
    label: 'Is registration information sent',
  }),
  registrationInfoSentDate: field({
    type: Date,
    optional: true,
    label: 'Registration information sent date',
  }),

  isSentPrequalificationInfo: field({
    type: Boolean,
    optional: true,
    default: false,
    label: 'Is prequalification information sent',
  }),
  prequalificationSubmittedCount: field({
    type: Number,
    optional: true,
    label: 'Prequalification submitted count',
  }),
  prequalificationInfoSentDate: field({
    type: Date,
    optional: true,
    label: 'Prequalification information sent date',
  }),

  isPrequalificationInfoEditable: field({
    type: Boolean,
    optional: true,
    default: true,
    label: 'Is prequalification information editable',
  }),

  isSkippedPrequalification: field({
    type: Boolean,
    default: false,
    label: 'is prequalification skipped',
  }),
  prequalificationSkippedReason: field({
    type: String,
    optional: true,
    label: 'Prequalification skipped reason',
  }),

  isPrequalified: field({ type: Boolean, optional: true, label: 'Is prequalified' }),
  prequalifiedDate: field({ type: Date, optional: true, label: 'Prequalified date' }),

  certificateInfo: field({
    type: CertificateInfoSchema,
    optional: true,
    label: 'Capacity building certificate information',
  }),

  financialInfo: field({
    type: FinancialInfoSchema,
    optional: true,
    label: 'Financial information',
  }),

  businessInfo: field({
    type: BusinessInfoSchema,
    optional: true,
    label: 'Business integrity & human resource',
  }),

  environmentalInfo: field({
    type: EnvironmentalInfoSchema,
    optional: true,
    label: 'Environmental management',
  }),

  healthInfo: field({
    type: HealthInfoSchema,
    optional: true,
    label: 'Health & safety management system',
  }),

  isProductsInfoValidated: field({
    type: Boolean,
    optional: true,
    label: 'Is products information validated',
  }),

  isQualified: field({ type: Boolean, optional: true, label: 'Is qualified' }),
  qualifiedDate: field({ type: Date, optional: true, label: 'Qualified date' }),

  productsInfo: field({ type: [String], optional: true, label: 'Products & services information' }),
  validatedProductsInfo: field({
    type: [String],
    optional: true,
    label: 'Validated product information',
  }),

  productsInfoValidations: field({
    type: [ProductsInfoValidation],
    optional: true,
    label: 'Product information validations',
  }),
  dueDiligences: field({ type: [DueDiligenceSchema], optional: true, label: 'Due diligences' }),
  difotScores: field({ type: [DateAmountSchema], optional: true, label: 'Difot scores' }),
  averageDifotScore: field({ type: Number, optional: true, label: 'Average difot score' }),

  isDeleted: field({ type: Boolean, default: false }),

  recommendations: field({ type: RecommendationSchema, optional: true, label: 'Recommendation' }),
});

class Company {
  /*
   * Sort by date and get last entry from products info validation
   */
  sortAndGetLast(fieldName) {
    const sorted = (this[fieldName] || []).sort(
      (prev, next) => new Date(prev.date) - new Date(next.date),
    );

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

  static async trimNames(basicInfo) {
    if (basicInfo.enName) {
      basicInfo.enName = basicInfo.enName.trim();
    }

    if (basicInfo.mnName) {
      basicInfo.mnName = basicInfo.mnName.trim();
    }

    return basicInfo;
  }

  static async getCompany(selector) {
    const company = await Companies.findOne(selector);

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  /**
   * Create a company
   * @param userId - Permforming user id
   * @return {Promise} Newly created company object
   */
  static async createCompany(userId, doc = {}) {
    if (doc && doc.basicInfo) {
      Companies.trimNames(doc.basicInfo);
    }

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
    Companies.trimNames(basicInfo);

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
  static async updateSection(_id, key, value, isRecommendation = false) {
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

    // prevent disabled prequalification info from editing ========
    const preqTabs = ['financial', 'business', 'environmental', 'health'];
    const editable = company.isPrequalificationInfoEditable;

    if (preqTabs.includes(key.replace('Info', '')) && !editable) {
      throw new Error('Changes disabled');
    }

    if (isRecommendation) {
      const recommendations = company.recommendations || {};

      recommendations[key] = value;

      // update
      await this.update(
        { _id },
        {
          $set: {
            recommendations,
          },
        },
      );
    } else {
      // update
      await this.update({ _id }, { $set: { [key]: value } });
    }

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

  /**
   * Adds new difot score
   * @param {Date} date
   * @param {number} amount
   * @returns updated company
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

    if (checkedItems.length === 0) {
      throw new Error('Please select at least one product');
    }

    productsInfoValidations.push({
      date: new Date(),
      checkedItems,
      files,
      personName,
      justification,
    });

    // update fields
    await this.update({
      productsInfoValidations,
      isProductsInfoValidated: true,
      validatedProductsInfo: filteredCheckedItems,
    });

    return Companies.findOne({ _id: this._id });
  }

  /*
   * Mark as sent registration info
   */
  async sendRegistrationInfo() {
    await this.update({ isSentRegistrationInfo: true, registrationInfoSentDate: new Date() });

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
      prequalificationInfoSentDate: new Date(),
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
      prequalificationInfoSentDate: new Date(),
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
      $set: {
        isPrequalificationInfoEditable: !company.isPrequalificationInfoEditable,
      },
    };

    if (company.isPrequalified) {
      updateQuery.$set.isPrequalified = false;
    } else {
      updateQuery.$unset = { isPrequalified: 1 };
    }

    await Companies.update({ _id }, updateQuery);

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

      case 'umnugovi':
        return 'Umnugovi';

      default:
        return '-';
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

  /*
   * Check whether given user is authorized to download given file or not
   * if given file is stored in companies collection
   */
  static async isAuthorizedToDownload(key, user) {
    // buyer can download all files
    if (!user.isSupplier) {
      return true;
    }

    const check = extraSelector => Companies.findOne({ _id: user.companyId, ...extraSelector });

    if (await check({ 'basicInfo.certificateOfRegistration.url': key })) {
      return true;
    }

    if (await check({ 'shareholderInfo.attachments.url': key })) {
      return true;
    }

    if (await check({ 'groupInfo.attachments.url': key })) {
      return true;
    }

    if (await check({ 'certificateInfo.file.url': key })) {
      return true;
    }

    if (await check({ 'financialInfo.recordsInfo.file.url': key })) {
      return true;
    }

    if (
      (await check({ 'businessInfo.doesMeetMinimumStandartsFile.url': key })) ||
      (await check({ 'businessInfo.doesHaveJobDescriptionFile.url': key })) ||
      (await check({ 'businessInfo.doesHaveLiabilityInsuranceFile.url': key })) ||
      (await check({ 'businessInfo.doesHaveCodeEthicsFile.url': key })) ||
      (await check({ 'businessInfo.doesHaveResponsiblityPolicyFile.url': key })) ||
      (await check({ 'businessInfo.organizationChartFile.url': key }))
    ) {
      return true;
    }

    if (
      (await check({ 'environmentalInfo.doesHavePlanFile.url': key })) ||
      (await check({ 'environmentalInfo.investigationDocumentation.url': key }))
    ) {
      return true;
    }

    if (
      (await check({ 'healthInfo.doesHaveHealthSafetyFile.url': key })) ||
      (await check({ 'healthInfo.areHSEResourcesClearlyIdentifiedFile.url': key })) ||
      (await check({ 'healthInfo.doesHaveDocumentedProcessToEnsureFile.url': key })) ||
      (await check({ 'healthInfo.areEmployeesUnderYourControlFile.url': key })) ||
      (await check({ 'healthInfo.doesHaveDocumentForRiskAssesmentFile.url': key })) ||
      (await check({ 'healthInfo.doesHaveDocumentForIncidentInvestigationFile.url': key })) ||
      (await check({ 'healthInfo.doesHaveDocumentedFitnessFile.url': key }))
    ) {
      return true;
    }

    return false;
  } // end isAuthorizedToDownload()

  static async getName(_id) {
    const company = await this.findOne({ _id });

    let name = '';

    if (company && company.basicInfo && company.basicInfo.enName) {
      name = company.basicInfo.enName;
    }

    return name;
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export const CompanyRelatedSchemas = [
  BasicInfoSchema,
  ContactInfoSchema,
  PersonSchema,
  ManagementTeamInfoSchema,
  ShareholderSchema,
  ShareholderInfoSchema,
  FactorySchema,
  GroupInfoSchema,
  CertificateInfoSchema,
  FinancialInfoSchema,
  InvestigationSchema,
  BusinessInfoSchema,
  EnvironmentalInfoSchema,
  HealthInfoSchema,
  DueDiligenceSchema,
  ProductsInfoValidation,
  CompanySchema,
  DateAmountSchema,
  FileSchema,
  YearAmountSchema,
  DateFileSchema,
];

export default Companies;
