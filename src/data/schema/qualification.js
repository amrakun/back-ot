import {
  financialInfoFields,
  businessInfoFields,
  environmentalInfoFields,
  healthInfoFields,
} from './company';

// Replacing ....
//
// reasonToCannotNotProvide: String,
// currency: String!,
//
// to
// reasonToCannotNotProvide: Boolean,
// currency: Boolean,
const generateFields = fields => fields.replace(/(\w+)(:\s\w+)/g, '$1: Boolean');

const qfinancialInfoFields = `
  ${generateFields(financialInfoFields)}
  annualTurnover: Boolean
  preTaxProfit: Boolean
  totalAssets: Boolean
  totalCurrentAssets: Boolean
  totalShareholderEquity: Boolean
  recordsInfo: Boolean
`;

const qbusinessInfoFields = `
  ${generateFields(businessInfoFields)}
  investigations: Boolean
`;

const qenvironmentalInfoFields = `
  ${generateFields(environmentalInfoFields)}
`;

const qhealthInfoFields = `
  ${generateFields(healthInfoFields)}
`;

export const types = `
  type QualificationFinancialInfo {${qfinancialInfoFields}}
  input QualificationFinancialInfoInput {${qfinancialInfoFields}}

  type QualificationBusinessInfo {${qbusinessInfoFields}}
  input QualificationBusinessInfoInput {${qbusinessInfoFields}}

  type QualificationEnvironmentalInfo {${qenvironmentalInfoFields}}
  input QualificationEnvironmentalInfoInput {${qenvironmentalInfoFields}}

  type QualificationHealthInfo {${qhealthInfoFields}}
  input QualificationHealthInfoInput {${qhealthInfoFields}}

  type Qualification {
    _id: String!
    companyId: String
    financialInfo: QualificationFinancialInfo
    businessInfo: QualificationBusinessInfo
    environmentalInfo: QualificationEnvironmentalInfo
    healthInfo: QualificationHealthInfo
  }
`;

export const queries = ``;

export const mutations = `
  qualificationsSaveFinancialInfo(
    companyId: String!,
    financialInfo: QualificationFinancialInfoInput
  ): Qualification

  qualificationsSaveBusinessInfo(
    companyId: String!,
    businessInfo: QualificationBusinessInfoInput
  ): Qualification

  qualificationsSaveEnvironmentalInfo(
    companyId: String!,
    environmentalInfo: QualificationEnvironmentalInfoInput
  ): Qualification

  qualificationsSaveHealthInfo(
    companyId: String!,
    healthInfo: QualificationHealthInfoInput
  ): Qualification
`;
