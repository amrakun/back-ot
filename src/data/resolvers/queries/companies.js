import { Companies } from '../../../db/models';
import { paginate } from './utils';
import { readTemplate, generateXlsx } from '../../utils';

/*
 * Filter companies
 */
const companiesFilter = ({ search, _ids, productCodes }) => {
  const selector = { basicInfo: { $ne: null } };

  // main filter
  if (search) {
    selector.$or = [
      { 'basicInfo.mnName': new RegExp(`.*${search}.*`, 'i') },
      { 'basicInfo.enName': new RegExp(`.*${search}.*`, 'i') },
      { 'basicInfo.sapNumber': new RegExp(`.*${search}.*`, 'i') },
    ];
  }

  // product & services filter
  if (productCodes) {
    selector.productsInfo = { $in: productCodes.split(',') };
  }

  // ids filter
  if (_ids) {
    selector._id = { $in: _ids };
  }

  return Companies.find(selector);
};

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { search, productCodes, _ids, ...params }) {
    return paginate(companiesFilter({ search, _ids, productCodes }), params);
  },

  /**
   * Export companies list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesExport(root, { search, productCodes, _ids }) {
    const companies = await companiesFilter({ search, _ids, productCodes });

    // read template
    const { workbook, sheet } = await readTemplate('suppliers');

    let rowIndex = 1;

    for (let company of companies) {
      rowIndex++;

      const basicInfo = company.basicInfo || {};
      const contactInfo = company.contactInfo || {};

      sheet.cell(rowIndex, 1).value(basicInfo.enName);
      sheet.cell(rowIndex, 2).value(basicInfo.sapNumber);
      sheet.cell(rowIndex, 11).value(contactInfo.email);
      sheet.cell(rowIndex, 12).value(contactInfo.phone);
    }

    // Write to file.
    return generateXlsx(workbook, 'suppliers');
  },

  /**
   * Get logged in user's company
   * @param {Object} args
   * @return {Promise} found company
   */
  companyByUser(root, args, { user }) {
    return Companies.findOne({ _id: user.companyId });
  },

  /**
   * Get one company
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found company
   */
  companyDetail(root, { _id }) {
    return Companies.findOne({ _id });
  },
};

export default companyQueries;
