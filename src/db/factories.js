/* eslint-disable no-underscore-dangle */

import faker from 'faker';

import {
  Companies,
  Users,
  Tenders,
  TenderResponses,
  Feedbacks,
  FeedbackResponses,
  Qualifications,
  Audits,
  AuditResponses,
  BlockedCompanies,
  Configs,
} from './models';

/*
 * Remove mongoose functionalities & convert to raw object
 */
const save = async object => {
  const savedObject = await object.save();

  const fixedObject = JSON.parse(JSON.stringify(savedObject));

  delete fixedObject.__v;

  return fixedObject;
};

export const companyFactory = (params = {}) => {
  if (typeof params.isSentRegistrationInfo === 'undefined') {
    params.isSentRegistrationInfo = true;
  }

  if (typeof params.isSentPrequalificationInfo === 'undefined') {
    params.isSentPrequalificationInfo = true;
  }

  const company = new Companies({
    createdDate: params.createdDate || new Date(),

    basicInfo: {
      enName: params.enName || faker.random.word(),
      mnName: params.mnName || faker.random.word(),
      isRegisteredOnSup: params.isRegisteredOnSup || false,
      isSubContractor: params.isSubContractor || false,
      sapNumber: params.sapNumber || faker.random.word(),
      email: params.email || faker.internet.email(),
      address: params.address || faker.random.word(),
      townOrCity: params.townOrCity || faker.random.word(),
      province: params.province || faker.random.word(),
      zipCode: params.zipCode || 976,
      country: params.country || 'Mongolia',
      registeredInCountry: params.registeredInCountry || 'Mongolia',
      corporateStructure: params.corporateStructure || faker.random.word(),
      registrationNumber: params.registrationNumber || faker.random.number(),
      foreignOwnershipPercentage: params.foreignOwnershipPercentage || faker.random.number(),
      totalNumberOfEmployees: faker.random.number(),
      totalNumberOfMongolianEmployees: faker.random.number(),
      totalNumberOfUmnugoviEmployees: faker.random.number(),
    },

    tierType: params.tierType,

    productsInfo: params.productsInfo || [],
    validatedProductsInfo: params.validatedProductsInfo || [],
    isProductsInfoValidated: params.isProductsInfoValidated || false,
    productsInfoLastValidatedDate: params.productsInfoLastValidatedDate || new Date(),

    isSentRegistrationInfo: params.isSentRegistrationInfo,
    isSentPrequalificationInfo: params.isSentPrequalificationInfo,

    isPrequalified: params.isPrequalified || false,
    isQualified: params.isQualified || false,

    difotScores: params.difotScores || [],
    averageDifotScore: params.averageDifotScore || 0,
    dueDiligences: params.dueDiligences || [],
  });

  return save(company);
};

export const companyDocs = {
  basic: () => ({
    enName: 'enNameUpdated',
    mnName: 'mnNameUpdated',
    sapNumber: 'sapNumber',
    isRegisteredOnSup: false,
    address: 'AddressUpdated',
    address2: 'Address2Updated',
    address3: 'Address3Updated',
    townOrCity: 'UlaanbaatarUpdated',
    province: 'UlaanbaatarUpdated',
    zipCode: 977,
    country: 'MongoliaUpdated',
    registeredInCountry: 'MongoliaUpdated',
    registeredInAimag: 'UmnugivUpdated',
    registeredInSum: 'BayntsagaanUpdated',
    isChinese: true,
    isSubContractor: false,
    corporateStructure: 'PartnershipUpdated',
    registrationNumber: 33483948394,
    certificateOfRegistration: { name: 'name', url: '/path' },
    email: 'companyUpdated@gmail.com',
    website: 'web.com',
    foreignOwnershipPercentage: '41',
    totalNumberOfEmployees: 101,
    totalNumberOfMongolianEmployees: 81,
    totalNumberOfUmnugoviEmployees: 11,
  }),

  contact: () => ({
    name: 'name',
    jobTitle: 'jobTitle',
    address: 'Address',
    address2: 'Address2',
    address3: 'Address3',
    townOrCity: 'Ulaanbaatar',
    province: 'Ulaanbaatar',
    zipCode: 976,
    country: 'Mongolia',
    phone: 24224242,
    phone2: 24224243,
    email: 'contact@gmail.com',
  }),

  managementTeam: () => {
    const generatePersonDoc = () => {
      return {
        name: `${Math.random()}name`,
        jobTitle: `${Math.random()}jobTitle`,
        phone: Math.random(),
        email: `${Math.random()}@gmail.com`,
      };
    };

    return {
      managingDirector: generatePersonDoc(),
      executiveOfficer: generatePersonDoc(),
      salesDirector: generatePersonDoc(),
      financialDirector: generatePersonDoc(),
      otherMember1: generatePersonDoc(),
      otherMember2: generatePersonDoc(),
      otherMember3: generatePersonDoc(),
    };
  },

  shareholder: () => {
    const generateShareholderDoc = () => {
      return {
        name: `${Math.random()}name`,
        jobTitle: `${Math.random()}jobTitle`,
        percentage: 10,
      };
    };

    return {
      attachments: [{ name: 'name', url: '/path1' }],
      shareholders: [generateShareholderDoc(), generateShareholderDoc()],
    };
  },

  group: () => {
    const generateFactoryDoc = () => {
      return {
        name: `${Math.random()}name`,
        townOrCity: `${Math.random()}townOrCity`,
        country: `${Math.random()}country`,
        productCodes: ['code'],
      };
    };

    return {
      hasParent: true,
      isParentExistingSup: true,
      parentName: 'parentName',
      parentAddress: 'parentAddress',
      parentRegistrationNumber: 'parentRegistrationNumber',
      role: 'manufacturer',
      isExclusiveDistributor: false,
      authorizedDistributions: ['1', '2'],
      attachments: [{ name: 'name', url: '/path1' }],
      primaryManufacturerName: 'primaryManufacturerName',
      countryOfPrimaryManufacturer: 'countryOfPrimaryManufacturer',
      factories: [generateFactoryDoc()],
    };
  },

  products: () => ['a10', 'c12'],

  certificate: () => ({
    isReceived: true,
    file: { name: 'name', url: 'url' },
  }),

  financial: () => ({
    canProvideAccountsInfo: true,
    reasonToCannotNotProvide: 'I dont know',
    currency: 'Euro (EUR)',
    annualTurnover: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
    preTaxProfit: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
    totalAssets: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
    totalCurrentAssets: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
    totalShareholderEquity: [{ year: 2010, amount: 1000 }, { year: 2008, amount: 2000 }],
    recordsInfo: [
      { date: '2010/10/1', file: { name: 'name', url: 'path1' } },
      { date: '2008/10/05', file: { name: 'name', url: 'path2' } },
    ],
    isUpToDateSSP: true,
    isUpToDateCTP: true,
  }),

  business: () => ({
    doesMeetMinimumStandarts: true,
    doesMeetMinimumStandartsFile: { name: 'name', url: 'url' },
    doesHaveJobDescription: true,
    doesHaveJobDescriptionFile: { name: 'name', url: 'url' },
    doesConcludeValidContracts: true,
    employeeTurnoverRate: 12,
    doesHaveLiabilityInsurance: false,
    doesHaveLiabilityInsuranceFile: { name: 'name', url: 'url' },
    doesHaveCodeEthics: true,
    doesHaveCodeEthicsFile: { name: 'name', url: 'url' },
    doesHaveResponsiblityPolicy: true,
    doesHaveResponsiblityPolicyFile: { name: 'name', url: 'url' },
    hasConvictedLabourLaws: true,
    hasConvictedForHumanRights: true,
    hasConvictedForBusinessIntegrity: false,
    proveHasNotConvicted: 'Lorem ipsum',
    hasLeadersConvicted: true,
    investigations: [
      { name: 'Name', date: '2010.01.01', status: 'Status', statusDate: '2011.01.01' },
    ],
    doesEmployeePoliticallyExposed: true,
    pepName: 'Lorem ipsum',
    organizationChartFile: { name: 'name', url: 'url' },
  }),

  environmental: () => ({
    doesHavePlan: true,
    doesHavePlanFile: { name: 'name', url: 'url' },
    hasEnvironmentalRegulatorInvestigated: true,
    dateOfInvestigation: '2010.01.01',
    reasonForInvestigation: 'Lorem ipsum',
    actionStatus: 'In Progress',
    investigationDocumentation: { name: 'name', url: 'path1' },
    hasConvictedForEnvironmentalLaws: true,
    proveHasNotConvicted: 'Lorem ipsum',
  }),

  health: () => ({
    doesHaveHealthSafety: true,
    doesHaveHealthSafetyFile: { name: 'name', url: 'url' },
    areHSEResourcesClearlyIdentified: true,
    doesHaveDocumentedProcessToEnsure: true,
    doesHaveDocumentedProcessToEnsureFile: { name: 'name', url: 'url' },
    areEmployeesUnderYourControl: true,
    doesHaveDocumentForRiskAssesment: true,
    doesHaveDocumentForRiskAssesmentFile: { name: 'name', url: 'url' },
    doesHaveDocumentForIncidentInvestigation: false,
    doesHaveDocumentForIncidentInvestigationFile: { name: 'name', url: 'url' },
    doesHaveDocumentedFitness: false,
    doesHaveDocumentedFitnessFile: { name: 'name', url: 'url' },
    isWillingToComply: false,
    hasIndustrialAccident: false,
    tmha: 'tmha',
    ltifr: 'ltifr',
    injuryExplanation: 'injuryExplanation',
    seniorManagement: 'seniorManagement',
    isWillingToCommit: true,
    isPerparedToCompile: true,
    hasWorkedOnWorldBank: true,
    hasWorkedOnWorldBankDescription: 'description',
    hasWorkedOnLargeProjects: true,
    hasWorkedOnLargeProjectsDescription: 'description',
    doesHaveLicense: true,
    doesHaveLicenseDescription: 'description',
  }),
};

export const userFactory = async (params = {}) => {
  if (params.isSupplier && !params.companyId) {
    const company = await companyFactory();

    params.companyId = company._id;
  }

  const user = new Users({
    username: params.username || faker.internet.userName(),

    role: params.role || 'contributor',

    firstName: params.firstName || faker.random.word(),
    lastName: params.lastName || faker.random.word(),
    jobTitle: params.jobTitle || faker.random.word(),
    phone: params.phone || faker.random.number(),

    email: params.email || faker.internet.email(),
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isSupplier: params.isSupplier || false,
    companyId: params.companyId,
  });

  return save(user);
};

export const tenderFactory = async (params = {}) => {
  const requestedProduct = {
    code: faker.random.word(),
    purchaseRequestNumber: faker.random.number(),
    shortText: faker.random.word(),
    quantity: faker.random.number(),
    uom: faker.random.word(),
    manufacturer: faker.random.word(),
    manufacturerPartNumber: faker.random.number(),
  };

  if (!params.createdUserId) {
    const user = await userFactory({ isSupplier: true });
    params.createdUserId = user._id;
  }

  if (!params.supplierIds) {
    const supplier = await companyFactory();
    params.supplierIds = [supplier._id];
  }

  if (!params.type) {
    params.type = 'rfq';
  }

  const tender = new Tenders({
    type: params.type,
    status: params.status || 'draft',
    number: params.number || faker.random.word(),
    name: params.name || faker.random.word(),
    content: params.content || faker.random.word(),

    createdUserId: params.createdUserId,
    createdDate: params.createdDate || new Date(),

    publishDate: params.publishDate || new Date(),
    closeDate: params.closeDate || new Date(),

    reminderDay: params.reminderDay || faker.random.number(),
    file: params.file || { name: 'name', url: 'url' },
    supplierIds: params.supplierIds,
    requestedProducts: params.requestedProducts || [requestedProduct],
    requestedDocuments: params.requestedDocuments,
    sentRegretLetter: params.sentRegretLetter || false,
  });

  return save(tender);
};

export const tenderResponseFactory = async (params = {}) => {
  if (!params.tenderId) {
    const tender = await tenderFactory();
    params.tenderId = tender._id;
  }

  if (!params.supplierId) {
    const supplier = await companyFactory();
    params.supplierId = supplier._id;
  }

  const tenderResponse = new TenderResponses({
    tenderId: params.tenderId,
    supplierId: params.supplierId,
    respondedProducts: params.respondedProducts,
    respondedDocuments: params.respondedDocuments,
    isSent: params.isSent || false,
    isNotInterested: params.isNotInterested || false,
  });

  return save(tenderResponse);
};

export const feedbackFactory = async (params = {}) => {
  if (!params.createdUserId) {
    const user = await userFactory();
    params.createdUserId = user._id;
  }

  if (!params.supplierIds) {
    const supplier = await companyFactory();
    params.supplierIds = [supplier._id];
  }

  const feedback = new Feedbacks({
    status: params.status || 'open',
    closeDate: params.closeDate || new Date(),
    supplierIds: params.supplierIds,
    content: params.content || faker.random.word(),
    createdDate: params.createdDate || new Date(),
    createdUserId: params.createdUserId,
  });

  return save(feedback);
};

export const feedbackResponseFactory = async (params = {}) => {
  if (!params.feedBackId) {
    const feedback = await feedbackFactory();
    params.feedbackId = feedback._id;
  }

  if (!params.supplierId) {
    const supplier = await companyFactory();
    params.supplierId = supplier._id;
  }

  const feedbackResponse = new FeedbackResponses({
    feedbackId: params.feedbackId,
    supplierId: params.supplierId,
    status: params.status || 'onTime',
    employmentNumberBefore: params.employmentNumberBefore || faker.random.number(),
    employmentNumberNow: params.employmentNumberNow || faker.random.number(),
    nationalSpendBefore: params.nationalSpendBefore || faker.random.number(),
    nationalSpendAfter: params.nationalSpendAfter || faker.random.number(),
    umnugobiSpendBefore: params.umnugobiSpendBefore || faker.random.number(),
    umnugobiSpendAfter: params.umnugobiSpendAfter || faker.random.number(),

    investment: params.investment || faker.random.word(),
    trainings: params.trainings || faker.random.word(),
    corporateSocial: params.corporateSocial || faker.random.word(),
    technologyImprovement: params.technologyImprovement || faker.random.word(),
  });

  return save(feedbackResponse);
};

export const qualificationFactory = async (params = {}) => {
  if (!params.supplierId) {
    const company = await companyFactory();
    params.supplierId = company._id;
  }

  const qualification = new Qualifications({
    supplierId: params.supplierId,
    financialInfo: params.financialInfo || {},
  });

  return save(qualification);
};

export const auditFactory = async (params = {}) => {
  if (!params.createdUserId) {
    const user = await userFactory();
    params.createdUserId = user._id;
  }

  if (!params.supplierIds) {
    const supplier = await companyFactory();
    params.supplierIds = [supplier._id];
  }

  const audit = new Audits({
    status: params.status || 'draft',
    supplierIds: params.supplierIds,
    publishDate: params.publishDate || new Date(),
    closeDate: params.closeDate || new Date(),
    createdUserId: params.createdUserId,
  });

  return save(audit);
};

// audit response docs ====================
const generateSection = ({ fields, supplier = true, buyer = true, answerType }) => {
  const value = {};

  for (let field of fields) {
    value[field] = {};

    if (supplier) {
      value[field].supplierComment = 'supplierComment';
      value[field].supplierAnswer = answerType === 'number' ? 0 : false;
    }

    if (buyer) {
      value[field].auditorComment = 'auditorComment';
      value[field].auditorRecommendation = 'auditorRecommendation';
      value[field].auditorScore = answerType === 'number' ? 1 : true;
    }
  }

  return value;
};

export const auditResponseDocs = {
  coreHseqInfo: (supplier, buyer) =>
    generateSection({
      fields: [
        'doesHaveHealthSafety',
        'doesHaveDocumentedPolicy',
        'doesPerformPreemployment',
        'doWorkProceduresConform',
        'doesHaveFormalProcess',
        'doesHaveTrackingSystem',
        'doesHaveValidIndustry',
        'doesHaveFormalProcessForReporting',
        'doesHaveLiabilityInsurance',
        'doesHaveFormalProcessForHealth',
      ],
      supplier,
      buyer,
    }),

  hrInfo: (supplier, buyer) =>
    generateSection({
      fields: [
        'workContractManagement',
        'jobDescriptionProcedure',
        'trainingDevelopment',
        'employeePerformanceManagement',
        'timeKeepingManagement',
        'managementOfPractises',
        'managementOfWorkforce',
        'employeeAwareness',
        'employeeSelection',
        'employeeExitManagement',
        'grievanceAndFairTreatment',
      ],
      supplier,
      buyer,
      answerType: 'number',
    }),

  businessInfo: (supplier, buyer) =>
    generateSection({
      fields: [
        'doesHavePolicyStatement',
        'ensureThroughoutCompany',
        'ensureThroughoutSupplyChain',
        'haveBeenSubjectToInvestigation',
        'doesHaveDocumentedPolicyToCorruption',
        'whoIsResponsibleForPolicy',
      ],
      supplier,
      buyer,
    }),

  evidenceInfo: () => ({
    doesHaveHealthSafety: true,
    doesHaveDrugPolicy: true,
    doesPerformPreemployment: true,
    workProceduresConform: true,
    doesHaveFormalProcessForHSE: true,
    doesHaveSystemForTracking: false,
    doesHaveValidCertifications: true,
    doesHaveSystemForReporting: true,
    doesHaveLiabilityInsurance: true,
    doesHaveFormalProcessForHealth: true,
    isThereCurrentContract: false,
    doesHaveJobDescription: true,
    doesHaveTraining: true,
    doesHaveEmployeeRelatedProcedure: true,
    doesHaveTimeKeeping: true,
    doesHavePerformancePolicy: false,
    doesHaveProcessToSupport: true,
    employeesAwareOfRights: true,
    doesHaveSystemToEnsureSafeWork: false,
    doesHaveEmployeeSelectionProcedure: true,
    doesHaveEmployeeLaborProcedure: true,
    doesHaveGrievancePolicy: true,
    proccessToEnsurePolicesCompany: true,
    proccessToEnsurePolicesSupplyChain: true,
    hasBeenSubjectToInvestigation: false,
    doesHaveCorruptionPolicy: true,
    whoIsResponsibleForCorruptionPolicy: true,
  }),
};

export const auditResponseFactory = async (params = {}) => {
  if (!params.auditId) {
    const audit = await auditFactory();
    params.auditId = audit._id;
  }

  if (!params.supplierId) {
    const supplier = await companyFactory();
    params.supplierId = supplier._id;
  }

  const auditResponse = new AuditResponses({
    auditId: params.auditId,
    supplierId: params.supplierId,
    isSent: params.isSent || false,
    isQualified: params.isQualified || false,
    coreHseqInfo: params.coreHseqInfo || auditResponseDocs.coreHseqInfo,
  });

  return save(auditResponse);
};

export const blockedCompanyFactory = params => {
  const blockedCompany = new BlockedCompanies({
    supplierId: params.supplierId || 'DFAFSFD',
    startDate: params.startDate || new Date(),
    endDate: params.endDate || new Date(),
    note: params.note || 'note',
    createdUserId: params.createdUserId || '_id',
  });

  return save(blockedCompany);
};

export const configDocs = {
  basicInfo: {
    logo: '/path',
    name: 'name',
    phone: 53535353,
    email: 'email@gmail.com',
    address: 'address',
  },

  prequalification: {
    common: {
      duration: 'year',
      amount: 2,
    },

    specific: {
      supplierIds: ['_id1', '_id2'],
      duration: 'month',
      amount: 2,
    },
  },

  audit: {
    common: {
      duration: 'year',
      amount: 2,
    },

    specific: {
      supplierIds: ['_id1', '_id2'],
      duration: 'month',
      amount: 2,
    },
  },

  improvementPlan: {
    common: {
      national: {
        duration: 'year',
        amount: 2,
      },
      umnugobi: {
        duration: 'year',
        amount: 2,
      },
      tier1: {
        duration: 'year',
        amount: 2,
      },
      tier2: {
        duration: 'year',
        amount: 2,
      },
      tier3: {
        duration: 'year',
        amount: 2,
      },
    },

    specific: {
      supplierIds: ['_id1', '_id2'],
      national: {
        duration: 'year',
        amount: 2,
      },
      umnugobi: {
        duration: 'year',
        amount: 2,
      },
      tier1: {
        duration: 'year',
        amount: 2,
      },
      tier2: {
        duration: 'year',
        amount: 2,
      },
      tier3: {
        duration: 'year',
        amount: 2,
      },
    },
  },
};

export const configFactory = params => {
  const config = new Configs({
    name: params.name || faker.random.word(),
  });

  return save(config);
};
