import { Companies, BlockedCompanies } from '../../../db/models';
import { paginate } from './utils';
import { readTemplate, generateXlsx } from '../../utils';
import { requireBuyer } from '../../permissions';
import { companyDetailExport } from './companyExports';

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
    isQualified,
    difotScore,
    region,
  } = args;

  const selector = {
    // ignore incomplete suppliers
    isSentRegistrationInfo: true,
    isSentPrequalificationInfo: true,
  };

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

  // tier types
  if (region) {
    selector.tierType = { $in: region.split(',') };
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

  // by qualified status
  if (isQualified) {
    selector.isQualified = isQualified;
  }

  // remove emtpy selector
  if (Object.keys(selector._id).length === 0) {
    delete selector._id;
  }

  return selector;
};

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, args) {
    const { sortField, sortDirection } = args;
    const selector = await companiesFilter(args);

    return paginate(Companies.find(selector).sort({ [sortField]: sortDirection || 1 }), args);
  },

  /**
   * Export companies list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesExport(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

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
   * Difot score list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesGenerateDifotScoreList(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    // read template
    const { workbook, sheet } = await readTemplate('difot_score');

    let rowIndex = 1;

    for (let company of companies) {
      rowIndex++;

      const basicInfo = company.basicInfo || {};

      sheet.cell(rowIndex, 1).value(basicInfo.sapNumber);
      sheet.cell(rowIndex, 2).value(basicInfo.enName);
      sheet.cell(rowIndex, 3).value('');
      sheet.cell(rowIndex, 4).value('');
    }

    // Write to file.
    return generateXlsx(workbook, 'difot_score');
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

  async companyDetailExport(root, { _id }) {
    const supplier = await Companies.findOne({ _id });
    return companyDetailExport(supplier);
  },

  /*
   * Companies count by tier type
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @return - Aggregated list
   */
  companiesCountByTierType(root, { startDate, endDate }) {
    return Companies.aggregate([
      { $match: { createdDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$tierType', count: { $sum: 1 } } },
    ]);
  },

  /*
   * Companies count by registered and prequalified status
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @return - Generated doc
   */
  async companiesCountByRegisteredVsPrequalified(root, args) {
    const { startDate, endDate, productCodes } = args;

    const selector = {
      createdDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (productCodes) {
      selector.validatedProductsInfo = { $in: productCodes.split(',') };
    }

    // find companies
    const companies = await Companies.find(selector);

    const results = {};

    for (let company of companies) {
      // 1/25/2018
      const key = company.createdDate.toLocaleDateString();

      // if key is not exists then create
      if (!results[key]) {
        results[key] = { registered: 0, prequalified: 0 };
      }

      // increment registered count
      results[key].registered += 1;

      // increment prequalified count
      if (company.isPrequalified) {
        results[key].prequalified += 1;
      }
    }

    // {
    // '1/25/2018': { registered: 1, prequalified: 0 },
    // '1/26/2018': { registered: 1, prequalified: 1 }
    // }
    return results;
  },
};

requireBuyer(companyQueries, 'companies');
requireBuyer(companyQueries, 'companiesExport');
requireBuyer(companyQueries, 'companyDetailExport');
requireBuyer(companyQueries, 'companiesCountByTierType');
requireBuyer(companyQueries, 'companiesCountByRegisteredVsPrequalified');

export default companyQueries;
