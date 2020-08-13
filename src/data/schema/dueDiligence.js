import {
  basicInfoFieldNames,
  shareholderFieldNames,
  personFieldNames,
  groupInfoFieldNames,
} from '../../db/models/constants';

const generateFields = names => {
  let fields = '';
  for (let name of names) {
    fields += `${name}: String\n`;
  }

  return fields;
};

const shareholderFields = `
  ${generateFields(shareholderFieldNames)}
`;

const basicInfoFields = `
  ${generateFields(basicInfoFieldNames)}
`;

const personFields = `
  ${generateFields(personFieldNames)}
`;

const groupInfoFields = `
  ${generateFields(groupInfoFieldNames)}
`;

export const types = `
  type shareholder {${shareholderFields}}
  input shareholderInput {
    ${shareholderFields}
  }

  type DueDiligenceShareholderInfo { shareholders: [shareholder]}
  input DueDiligenceShareholderInfoInput {shareholders: [shareholderInput]}


  type DueDiligenceBasicInfo {${basicInfoFields}}
  input DueDiligenceBasicInfoInput {${basicInfoFields}}

  input personInput {
    ${personFields}
  }

  type personInfo {${personFields}}
  input DueDiligenceManagementTeamInfoInput {
    managingDirector: personInput,
    executiveOfficer: personInput
  }

  type DueDiligenceManagementTeamInfo {
    managingDirector: personInfo
    executiveOfficer: personInfo
  }

  type DueDiligenceGroupInfo {${groupInfoFields}}
  input DueDiligenceGroupInfoInput {${groupInfoFields}}

  # main type =============================
  type DueDiligence {
    _id: String!
    supplierId: String!
    
    basicInfo: DueDiligenceBasicInfo
    shareholderInfo: DueDiligenceShareholderInfo
    managementTeamInfo: DueDiligenceManagementTeamInfo
    groupInfo: DueDiligenceGroupInfo

    date: Date
    expireDate: Date
    file: JSON
    createdUserId: String
    createdUser: User
    risk: String
  }
`;

export const queries = `
  lastDueDiligence(supplierId: String!): DueDiligence
`;

export const mutations = `
  dueDiligencesSaveShareholderInfo(
    supplierId: String!
    shareholderInfo: DueDiligenceShareholderInfoInput
  ): DueDiligence

  dueDiligencesSaveBasicInfo(
    supplierId: String!
    basicInfo: DueDiligenceBasicInfoInput
  ): DueDiligence

  dueDiligencesSaveManagementTeamInfo(
    supplierId: String!
    managementTeamInfo: DueDiligenceManagementTeamInfoInput
  ): DueDiligence

  dueDiligencesSaveGroupInfo(
    supplierId: String!
    groupInfo: DueDiligenceGroupInfoInput
  ): DueDiligence

  dueDiligencesSave(supplierId: String!): Company
  dueDiligencesCancel(supplierId: String!): Company
  dueDiligencesEnableState(supplierId: String!): DueDiligence
  dueDiligencesUpdate(
    supplierId: String!,
    file: JSON,
    risk: String,
    date: Date,
    closeDate: Date,
    reminderDay: Int
  ): DueDiligence
`;
