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
  PhysicalAudits,
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
      sapNumber: params.sapNumber || faker.random.word(),
      email: params.email || faker.internet.email(),
      address: params.address || faker.random.word(),
      townOrCity: params.townOrCity || faker.random.word(),
      province: params.province || faker.random.word(),
      zipCode: params.zipCode || 976,
      country: params.country || 'Mongolia',
      certificateOfRegistration: params.certificateOfRegistration || { name: 'name', url: 'url' },
      registeredInCountry: params.registeredInCountry || 'Mongolia',
      corporateStructure: params.corporateStructure || faker.random.word(),
      registrationNumber: params.registrationNumber || faker.random.word(),
      foreignOwnershipPercentage: params.foreignOwnershipPercentage || faker.random.number(),
      totalNumberOfEmployees: faker.random.number(),
      totalNumberOfMongolianEmployees: faker.random.number(),
      totalNumberOfUmnugoviEmployees: faker.random.number(),
    },

    shareholderInfo: params.shareholderInfo,
    groupInfo: params.groupInfo,
    certificateInfo: params.certificateInfo,
    financialInfo: params.financialInfo,
    businessInfo: params.businessInfo,
    businessInfo: params.businessInfo,
    environmentalInfo: params.environmentalInfo,
    healthInfo: params.healthInfo,

    tierType: params.tierType,

    isSentRegistrationInfo: params.isSentRegistrationInfo,

    isSentPrequalificationInfo: params.isSentPrequalificationInfo,
    isPrequalificationInfoEditable: params.isPrequalificationInfoEditable,
    isPrequalified: params.isPrequalified,
    prequalifiedDate: params.prequalifiedDate,

    isProductsInfoValidated: params.isProductsInfoValidated,

    isQualified: params.isQualified,
    qualifiedDate: params.qualifiedDate,

    productsInfo: params.productsInfo || [],
    validatedProductsInfo: params.validatedProductsInfo || [],
    productsInfoValidations: params.productsInfoValidations || [],
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
    corporateStructure: 'PartnershipUpdated',
    registrationNumber: '33483948394',
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
      role: ['manufacturer'],
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
    description: 'description',
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
    doesHaveLiabilityInsurance: true,
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

    hasConvictedLabourLawsDescription: 'hasConvictedLabourLawsDescription',
    hasConvictedForHumanRightsDescription: 'hasConvictedForHumanRightsDescription',

    isSubContractor: false,
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
    areEmployeesUnderYourControlFile: { name: 'name', url: 'url' },
    doesHaveDocumentForRiskAssesment: true,
    doesHaveDocumentForRiskAssesmentFile: { name: 'name', url: 'url' },
    doesHaveDocumentForIncidentInvestigation: true,
    doesHaveDocumentForIncidentInvestigationFile: { name: 'name', url: 'url' },
    doesHaveDocumentedFitness: true,
    doesHaveDocumentedFitnessFile: { name: 'name', url: 'url' },
    areHSEResourcesClearlyIdentifiedFile: { name: 'name', url: 'url' },
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

    role: params.role || 'admin',

    firstName: params.firstName || faker.name.firstName(),
    lastName: params.lastName || faker.name.firstName(),
    jobTitle: params.jobTitle || faker.random.word(),
    phone: params.phone || faker.random.number(),
    responsibleBuyerIds: params.responsibleBuyerIds || [],

    email: params.email || faker.internet.email(),
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isSupplier: params.isSupplier || false,
    isActive: typeof(params.isActive) === 'undefined' ? true : params.isActive,
    companyId: params.companyId,
    delegatedUserId: params.delegatedUserId,
    delegationStartDate: params.delegationStartDate,
    delegationEndDate: params.delegationEndDate,
  });

  return save(user);
};

export const tenderDoc = async (params = {}) => {
  const requestedProduct = {
    code: faker.random.word(),
    purchaseRequestNumber: faker.random.number(),
    shortText: faker.random.word(),
    quantity: faker.random.number(),
    uom: faker.random.word(),
    manufacturer: faker.random.word(),
    manufacturerPartNumber: faker.random.word(),
  };

  if (!params.supplierIds) {
    const supplier = await companyFactory();
    params.supplierIds = [supplier._id.toString()];
  }

  const doc = {
    number: params.number || faker.random.word(),
    sourcingOfficer: params.sourcingOfficer || faker.random.word(),
    name: params.name || faker.random.word(),
    content: params.content || faker.random.word(),
    attachments: params.attachments || [{ name: 'name', url: 'url' }],

    publishDate: params.publishDate || new Date(),
    closeDate: params.closeDate || new Date(),

    reminderDay: params.reminderDay || faker.random.number(),
    file: params.file || { name: 'name', url: 'url' },
    supplierIds: params.supplierIds,
    requestedProducts: params.requestedProducts || [requestedProduct],
    requestedDocuments: params.requestedDocument || [],
    isToAll: params.isToAll || false,
    tierTypes: params.tierTypes || [],
  };

  if (params.type) {
    doc.type = params.type;
  }

  if (doc.type === 'rfq' && !doc.rfqType) {
    doc.rfqType = 'goods';
  }

  return doc;
};

export const tenderFactory = async (params = {}) => {
  const doc = await tenderDoc(params);

  doc.winnerIds = params.winnnerIds || [];
  doc.sentRegretLetter = params.sentRegretLetter || false;

  if (!params.type) {
    doc.type = 'rfq';
  }

  if (doc.type === 'rfq' && !doc.rfqType) {
    doc.rfqType = 'goods';
  }

  let createdUserId = params.createdUserId;

  if (!createdUserId) {
    const user = await userFactory({ isSupplier: true });
    createdUserId = user._id;
  }

  let tender = await Tenders.createTender(doc, createdUserId);
  const _id = tender._id;

  // force status
  await Tenders.update({ _id }, { $set: { status: params.status || 'draft' } });

  // force createdDate
  if (params.createdDate) {
    await Tenders.update({ _id }, { $set: { createdDate: params.createdDate } });
  }

  return Tenders.findOne({ _id });
};

export const tenderResponseDoc = async (params = {}) => {
  if (!params.tenderId) {
    const tender = await tenderFactory();
    params.tenderId = tender._id;
  }

  if (!params.supplierId) {
    const supplier = await companyFactory();
    params.supplierId = supplier._id;
  }

  return {
    tenderId: params.tenderId,
    supplierId: params.supplierId,
    respondedProducts: params.respondedProducts,
    respondedDocuments: params.respondedDocuments,
    respondedFiles: params.respondedFiles,
    isNotInterested: params.isNotInterested || false,
  };
};

export const tenderResponseFactory = async (params = {}) => {
  const doc = await tenderResponseDoc(params);

  const response = await TenderResponses.createTenderResponse(doc);

  if (typeof params.isSent !== 'undefined') {
    await TenderResponses.update({ _id: response._id }, { $set: { isSent: params.isSent } });
  }

  return TenderResponses.findOne({ _id: response._id });
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

    totalEmploymentOt: params.totalEmploymentOt || faker.random.number(),
    totalEmploymentUmnugovi: params.totalEmploymentUmnugovi || faker.random.number(),
    employmentChangesAfter: params.employmentChangesAfter || faker.random.number(),

    numberOfEmployeeWorkToScopeNational:
      params.numberOfEmployeeWorkToScopeNational || faker.random.number(),
    numberOfEmployeeWorkToScopeUmnugovi:
      params.numberOfEmployeeWorkToScopeUmnugovi || faker.random.number(),

    procurementTotalSpend: params.procurementTotalSpend || faker.random.number(),
    procurementNationalSpend: params.procurementNationalSpend || faker.random.number(),
    procurementUmnugoviSpend: params.procurementUmnugoviSpend || faker.random.number(),

    corporateSocial: params.corporateSocial || faker.random.word(),
    otherStories: params.otherStories || faker.random.word(),

    createdDate: params.createdDate || new Date(),
  });

  return save(feedbackResponse);
};

export const qualificationFactory = async (params = {}) => {
  if (!params.supplierId) {
    const company = await companyFactory();
    params.supplierId = company._id;
  }

  const qualification = new Qualifications({
    createdDate: new Date(),
    supplierId: params.supplierId,
    financialInfo: params.financialInfo,
    businessInfo: params.businessInfo,
    environmentalInfo: params.environmentalInfo,
    healthInfo: params.healthInfo,
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
    createdDate: new Date(),
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
    createdDate: new Date(),
    auditId: params.auditId,
    supplierId: params.supplierId,
    isSent: params.isSent || false,
    isEditable: params.isEditable || false,
    isQualified: params.isQualified || false,
    isBuyerNotified: params.isBuyerNotified || false,

    coreHseqInfo: params.coreHseqInfo || auditResponseDocs.coreHseqInfo,
    hrInfo: params.hrInfo,
    businessInfo: params.businessInfo,

    improvementPlanFile: params.improvementPlanFile,
    improvementPlanSentDate: params.improvementPlanSentDate,
    reportFile: params.reportFile,
  });

  const savedResponse = await save(auditResponse);

  if (params.status) {
    await AuditResponses.update({ _id: savedResponse._id }, { $set: { status: params.status } });
  }

  return AuditResponses.findOne({ _id: savedResponse._id });
};

export const blockedCompanyFactory = async params => {
  if (!params.supplierId) {
    const supplier = await companyFactory();
    params.supplierId = supplier._id;
  }

  if (!params.createdUserId) {
    const user = await userFactory();
    params.createdUserId = user._id;
  }

  const blockedCompany = new BlockedCompanies({
    supplierId: params.supplierId,
    groupId: params.groupId || 'DFAFSFD',
    startDate: params.startDate || new Date(),
    endDate: params.endDate || new Date(),
    note: params.note || 'note',
    createdUserId: params.createdUserId,
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
      umnugovi: {
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
      umnugovi: {
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

export const physicalAuditFactory = async (params = {}) => {
  if (!params.supplierId) {
    const company = await companyFactory();

    params.supplierId = company._id;
  }

  if (!params.createdUserId) {
    const user = await userFactory();

    params.createdUserId = user._id;
  }

  const physicalAudit = new PhysicalAudits({
    createdDate: new Date(),
    createdUserId: params.createdUserId,
    isQualified: params.isQualified || true,
    supplierId: params.supplierId,
    reportFile: params.reportFile || '/reportFile',
    improvementPlanFile: params.improvementPlanFile || '/improvementPlanFile',
  });

  return save(physicalAudit);
};

export const configFactory = (params = {}) => {
  const withLanguage = { mn: '', en: '' };

  const commonTemplate = {
    from: 'from@ot.mn',
    subject: withLanguage,
    content: withLanguage,
  };

  const config = new Configs({
    name: params.name || faker.random.word(),
    prequalificationDow: params.prequalificationDow,
    specificPrequalificationDow: params.specificPrequalificationDow,
    auditDow: params.auditDow,
    specificAuditDow: params.specificAuditDow,
    improvementPlanDow: params.improvementPlanDow,
    specificImprovementPlanDow: params.specificImprovementPlanDow,
    rfqTemplates: {
      buyer__award: commonTemplate,
      supplier__award: commonTemplate,
      supplier__regretLetter: commonTemplate,
      buyer__cancel: commonTemplate,
      supplier__cancel: commonTemplate,
      supplier__message_notification: commonTemplate,
      buyer__message_notification: commonTemplate,
    },
    capacityBuildingTemplates: {
      buyer__submit: commonTemplate,
      supplier__submit: commonTemplate,
      supplier__enable: commonTemplate,
    },
    successFeedbackTemplates: {
      buyer__new: commonTemplate,
      supplier__new: commonTemplate,
    },
    blockTemplates: {
      buyer__block: commonTemplate,
    },
    prequalificationTemplates: {
      supplier__qualified: commonTemplate,
      supplier__failed: commonTemplate,
      supplier__submit: commonTemplate,
      buyer__submit: commonTemplate,
    },
    desktopAuditTemplates: {
      buyer__submit: commonTemplate,
      supplier__invitation: commonTemplate,
      supplier__failed: commonTemplate,
      supplier__approved_with_improvement_plan: commonTemplate,
      supplier__approved: commonTemplate,
    },
  });

  return save(config);
};
