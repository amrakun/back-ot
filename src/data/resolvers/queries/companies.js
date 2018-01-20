import { Companies, BlockedCompanies } from '../../../db/models';
import { paginate } from './utils';
import { readTemplate, generateXlsx } from '../../utils';
import { requireBuyer } from '../../permissions';

/*
 * Filter companies
 */
const companiesFilter = async args => {
  const {
    search,
    _ids,
    productCodes,
    isProductsInfoValidated,
    includeBlocked,
    isPrequalified,
    difotScore,
  } = args;

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
    selector.validatedProductsInfo = { $in: productCodes.split(',') };
  }

  // difot score
  if (difotScore) {
    let max = 25;
    let min = 0;

    if (difotScore === '26-50') {
      max = 50;
      min = 26;
    }

    if (difotScore === '51-75') {
      max = 75;
      min = 51;
    }

    if (difotScore === '76-100') {
      max = 100;
      min = 76;
    }

    selector.averageDifotScore = { $gte: min, $lte: max };
  }

  selector._id = {};

  // ids filter
  if (_ids) {
    selector._id.$in = _ids;
  }

  // by is products info validated
  if (isProductsInfoValidated) {
    selector.isProductsInfoValidated = isProductsInfoValidated;
  }

  // include blocked
  if (!includeBlocked) {
    selector._id.$nin = await BlockedCompanies.blockedIds();
  }

  // by pre qualified status
  if (isPrequalified) {
    selector.isPrequalified = isPrequalified;
  }

  // remove emtpy selector
  if (Object.keys(selector._id).length === 0) {
    delete selector._id;
  }

  return Companies.find(selector);
};

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, args) {
    return paginate(await companiesFilter(args), args);
  },

  /**
   * Export companies list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesExport(root, args) {
    const companies = await companiesFilter(args);

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

  async suppliersProfileDetail(root, { _id }) {
    const supplier = await Companies.findOne({ _id });

    const { workbook } = await readTemplate('suppliers_profile_detail');
    const sheetA = workbook.sheet(0);

    const basicInfo = supplier.basicInfo || {};
    const contactInfo = supplier.contactInfo || {};

    sheetA.cell(4, 3).value(basicInfo.enName || '');
    sheetA.cell(7, 3).value(basicInfo.address || '');
    sheetA.cell(9, 3).value(basicInfo.address2 || '');
    sheetA.cell(11, 3).value(basicInfo.address3 || '');

    sheetA.cell(13, 3).value(basicInfo.townOrCity || '');
    sheetA.cell(15, 3).value(basicInfo.province || '');
    sheetA.cell(17, 3).value(basicInfo.zipCode || '');
    sheetA.cell(19, 3).value(basicInfo.country || '');

    sheetA.cell(27, 3).value(basicInfo.country || '');
    sheetA.cell(30, 3).value(basicInfo.registeredInAimag || '');
    sheetA.cell(32, 3).value(basicInfo.registeredInSum || '');

    sheetA.cell(39, 3).value(basicInfo.isChinese ? 'yes' : 'no');
    sheetA.cell(44, 3).value(basicInfo.isSubcontractor ? 'yes' : 'no');
    sheetA.cell(50, 3).value(basicInfo.corporateStructure);

    sheetA.cell(61, 3).value(basicInfo.registrationNumber);
    sheetA
      .cell(64, 3)
      .value(basicInfo.certificateOfRegistration ? basicInfo.certificateOfRegistration.url : '');
    sheetA.cell(79, 3).value(basicInfo.website || '');
    sheetA.cell(81, 3).value(basicInfo.email || '');
    sheetA.cell(84, 3).value(basicInfo.foreignOwnershipPercentage || '');

    sheetA.cell(91, 3).value(basicInfo.totalNumberOfEmployees || '');
    sheetA.cell(93, 3).value(basicInfo.totalNumberOfMongolianEmployees || '');
    sheetA.cell(95, 3).value(basicInfo.totalNumberOfUmnugoviEmployees || '');

    sheetA.cell(100, 3).value(contactInfo.name || '');
    sheetA.cell(101, 3).value(contactInfo.jobTitle || '');
    sheetA.cell(102, 3).value(contactInfo.address || '');
    sheetA.cell(103, 3).value(contactInfo.address2 || '');
    sheetA.cell(104, 3).value(contactInfo.address3 || '');
    sheetA.cell(108, 3).value(contactInfo.phone || '');
    sheetA.cell(109, 3).value(contactInfo.phone2 || '');
    sheetA.cell(110, 3).value(contactInfo.email || '');

    return generateXlsx(workbook, 'suppliers_profile_detail');
  },
};

requireBuyer(companyQueries, 'companies');
requireBuyer(companyQueries, 'companiesExport');

export default companyQueries;
