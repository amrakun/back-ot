import { Companies } from '../../../db/models';

const companyMutations = {
  /**
   * Create new company also adds Company registration log
   * @return {Promise} company object
   */
  async companiesAdd(root, { basicInfo }) {
    return Companies.createCompany(basicInfo);
  },

  /**
   * Update company basic info
   * @return {Promise} company object
   */
  async companiesEditBasicInfo(root, { _id, basicInfo }) {
    return Companies.updateBasicInfo(_id, basicInfo);
  },
};

export default companyMutations;
