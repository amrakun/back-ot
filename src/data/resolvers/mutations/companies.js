import { Companies } from '../../../db/models';

const companyMutations = {
  /**
   * Create new company also adds Company registration log
   * @return {Promise} company object
   */
  async companiesAdd(root, { basicInfo }) {
    return Companies.createCompany(basicInfo);
  },

  /*
   * Update company basic info
   */
  async companiesEditBasicInfo(root, { _id, basicInfo }) {
    return Companies.updateBasicInfo(_id, basicInfo);
  },

  /**
   * Update company contact info
   */
  async companiesEditContactInfo(root, { _id, contactInfo }) {
    return Companies.updateContactInfo(_id, contactInfo);
  },

  /**
   * Update company management team
   */
  async companiesEditManagementTeam(root, { _id, managementTeam }) {
    return Companies.updateManagementTeam(_id, managementTeam);
  },

  /**
   * Update company shareholders
   */
  async companiesEditShareholders(root, { _id, shareholders }) {
    return Companies.updateShareholderInfo(_id, shareholders);
  },

  /**
   * Update company group info
   */
  async companiesEditGroupInfo(root, { _id, groupInfo }) {
    return Companies.updateGroupInfo(_id, groupInfo);
  },
};

export default companyMutations;
