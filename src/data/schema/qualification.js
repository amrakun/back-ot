import {
  financialInfoQualifiableFields,
  businessInfoQualifiableFields,
  environmentalInfoQualifiableFields,
  healthInfoQualifiableFields,
} from './company';

// Replacing ....
//
// reasonToCannotNotProvide: String,
// currency: String!,
//
// to
// reasonToCannotNotProvide: Boolean,
// currency: Boolean,
const generateFields = fields => {
  return fields.replace(/(\w+)(:\s\w+)/g, '$1: Boolean');
};

const qfinancialInfoFields = `
  ${generateFields(financialInfoQualifiableFields)}
  annualTurnover: Boolean
  preTaxProfit: Boolean
  totalAssets: Boolean
  totalCurrentAssets: Boolean
  totalShareholderEquity: Boolean
  recordsInfo: Boolean
`;

const qbusinessInfoFields = `
  ${generateFields(businessInfoQualifiableFields)}
  investigations: Boolean
`;

const qenvironmentalInfoFields = `
  ${generateFields(environmentalInfoQualifiableFields)}
`;

const qhealthInfoFields = `
  ${generateFields(healthInfoQualifiableFields)}
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
    supplierId: String
    financialInfo: QualificationFinancialInfo
    businessInfo: QualificationBusinessInfo
    environmentalInfo: QualificationEnvironmentalInfo
    healthInfo: QualificationHealthInfo
    tierType: String

    company: Company
  }
`;

export const queries = `
  qualificationDetail(supplierId: String!): Qualification
  qualificationDetailByUser: Qualification
  qualificationPrequalificationReplacer(supplierId: String!): JSON
`;

export const mutations = `
  qualificationsSaveFinancialInfo(
    supplierId: String!,
    financialInfo: QualificationFinancialInfoInput
  ): Qualification

  qualificationsSaveBusinessInfo(
    supplierId: String!,
    businessInfo: QualificationBusinessInfoInput
  ): Qualification

  qualificationsSaveEnvironmentalInfo(
    supplierId: String!,
    environmentalInfo: QualificationEnvironmentalInfoInput
  ): Qualification

  qualificationsSaveHealthInfo(
    supplierId: String!,
    healthInfo: QualificationHealthInfoInput
  ): Qualification

  qualificationsSaveTierType(
    supplierId: String!,
    tierType: String!
  ): Qualification

  qualificationsPrequalify(
    supplierId: String!,
    qualified: Boolean,
    templateObject: JSON
  ): Company
`;
