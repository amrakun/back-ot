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
  async companiesEditShareholderInfo(root, { _id, shareholderInfo }) {
    return Companies.updateShareholderInfo(_id, shareholderInfo);
  },

  /**
   * Update company group info
   */
  async companiesEditGroupInfo(root, { _id, groupInfo }) {
    return Companies.updateGroupInfo(_id, groupInfo);
  },

  /**
   * Update company certificate info
   */
  async companiesEditCertificateInfo(root, { _id, certificateInfo }) {
    return Companies.updateCertificateInfo(_id, certificateInfo);
  },

  /**
   * Update company products info
   */
  async companiesEditProductsInfo(root, { _id, productsInfo }) {
    return Companies.updateProductsInfo(_id, productsInfo);
  },

  /**
   * Update company financial info
   */
  async companiesEditFinancialInfo(root, { _id, financialInfo }) {
    return Companies.updateFinancialInfo(_id, financialInfo);
  },

  /**
   * Update company business ingegrity and human resource
   */
  async companiesEditBusinessAndHumanResource(root, { _id, businessAndHumanResource }) {
    return Companies.updateBusinessAndHumanResource(_id, businessAndHumanResource);
  },

  /**
   * Update company environmental management
   */
  async companiesEditEnvironmentalManagement(root, { _id, environmentalManagement }) {
    return Companies.updateEnvironmentalManagement(_id, environmentalManagement);
  },

  /**
   * Update company health and safety management system
   */
  async companiesEditHealthAndSafetyManagement(root, { _id, healthAndSafetyManagement }) {
    return Companies.updateHealthAndSafetyManagement(_id, healthAndSafetyManagement);
  },
};

export default companyMutations;
