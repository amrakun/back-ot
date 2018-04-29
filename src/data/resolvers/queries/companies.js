import { Companies, BlockedCompanies, Qualifications, SearchLogs } from '../../../db/models';

import { paginate } from './utils';
import { requireBuyer, requireSupplier } from '../../permissions';
import {
  companyDetailExport,
  companiesExport,
  companiesGenerateDifotScoreList,
  companiesGenerateDueDiligenceList,
  companiesValidatedProductsInfoExport,
  companiesGeneratePrequalificationList,
} from './companyExports';

/*
 * Filter companies
 */
const companiesFilter = async args => {
  const {
    search,
    _ids,
    productCodes,
    includeBlocked,
    prequalifiedStatus,
    qualifiedStatus,
    productsInfoStatus,
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

  // include blocked
  if (!includeBlocked) {
    selector._id.$nin = await BlockedCompanies.blockedIds();
  }

  const checkStatus = (variable, fieldName) => {
    if (variable) {
      if (variable === 'undefined') {
        selector[fieldName] = null;
      } else {
        selector[fieldName] = variable === 'yes' ? true : false;
      }
    }
  };

  // by is products info validated
  checkStatus(productsInfoStatus, 'isProductsInfoValidated');

  // by pre qualified status
  checkStatus(prequalifiedStatus, 'isPrequalified');

  // by qualified status
  checkStatus(qualifiedStatus, 'isQualified');

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
  async companies(root, args, { user }) {
    const selector = await companiesFilter(args);

    if (!user.isSupplier) {
      SearchLogs.createLog(user._id);
    }

    return paginate(Companies.find(selector), args);
  },

  /**
   * Companies total count
   * @param {Object} args - Query params
   * @return {Promise} count
   */
  async companiesTotalCount(root, args) {
    const selector = await companiesFilter(args);

    return Companies.find(selector).count();
  },

  /**
   * Export companies list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesExport(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    return companiesExport(companies);
  },

  /**
   * Export companies list with validated products info
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesValidatedProductsInfoExport(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    return companiesValidatedProductsInfoExport(companies);
  },

  /**
   * Difot score list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesGenerateDifotScoreList(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    return companiesGenerateDifotScoreList(companies);
  },

  /**
   * Due diligence list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesGenerateDueDiligenceList(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    return companiesGenerateDueDiligenceList(companies);
  },

  /**
   * Prequalification list
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async companiesGeneratePrequalificationList(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    return companiesGeneratePrequalificationList(companies);
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

  /*
   * Export supplier from buyer
   */
  async companyDetailExport(root, { _id }) {
    const supplier = await Companies.findOne({ _id });

    return companyDetailExport(supplier);
  },

  /*
   * Export supplier from supplier
   */
  async companyDetailSupplierExport(root, args, { user }) {
    const supplier = await Companies.findOne({ _id: user.companyId });

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
      { $sort: { _id: 1 } },
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
        results[key] = {
          registered: 0,
          prequalified: 0,
          notPrequalified: 0,
          prequalificationPending: 0,
        };
      }

      // increment registered count
      results[key].registered += 1;

      // buyer did something
      if (typeof company.isPrequalified !== 'undefined') {
        // qualified
        if (company.isPrequalified) {
          results[key].prequalified += 1;

          // not qualified
        } else {
          results[key].notPrequalified += 1;
        }

        // supplier sent but buyer did not responded yet
      } else if (company.isSentPrequalificationInfo) {
        results[key].prequalificationPending += 1;
      }
    }

    // {
    // '1/25/2018': { registered: 1, prequalified: 0, etc... },
    // '1/26/2018': { registered: 1, prequalified: 1, etc... }
    // }
    return results;
  },

  /*
   * Companies count by product code
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @return - Generated doc
   */
  async companiesCountByProductCode(root, args) {
    const { startDate, endDate } = args;

    const selector = {};

    if (startDate && endDate) {
      selector.createdDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // find companies
    const companies = await Companies.find(selector);

    const parentLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const results = {};

    parentLetters.forEach(letter => {
      results[letter] = { validated: 0, prequalified: 0, registered: 0 };
    });

    for (const company of companies) {
      const productsInfo = company.productsInfo || [];

      for (const letter of parentLetters) {
        // products info must contain this letter
        if (!productsInfo.find(p => p.startsWith(letter))) {
          continue;
        }

        // count as registered
        results[letter].registered++;

        // count as validated
        if (company.isProductsInfoValidated) {
          results[letter].validated++;
        }

        // count as prequalified
        if (company.isPrequalified) {
          results[letter].prequalified++;
        }
      }
    }

    return results;
  },

  /**
   * Count companies by prequalification status's tabs
   * @param {Object} args - Query params
   * @return {Object} - Count map
   */
  async companiesPrequalifiedStatus(root, args) {
    const selector = await companiesFilter(args);
    const companies = await Companies.find(selector);

    let financialInfo = 0;
    let businessInfo = 0;
    let environmentalInfo = 0;
    let healthInfo = 0;

    let approved = 0;
    let outstanding = 0;
    let failed = 0;
    let expired = 0;

    // Check per section's all values are true
    const count = (section, count) => {
      if (Qualifications.isSectionPassed(section)) {
        count++;
      }

      return count;
    };

    for (const company of companies) {
      const qualif = await Qualifications.findOne({ supplierId: company._id });

      if (!qualif) {
        continue;
      }

      financialInfo = count(qualif.financialInfo, financialInfo);
      businessInfo = count(qualif.businessInfo, businessInfo);
      environmentalInfo = count(qualif.environmentalInfo, environmentalInfo);
      healthInfo = count(qualif.healthInfo, healthInfo);

      // count by status =================
      const status = await Qualifications.status(company._id);

      if (status.isApproved) {
        approved++;
      }

      if (status.isFailed) {
        failed++;
      }

      if (status.isOutstanding) {
        outstanding++;
      }

      if (status.isExpired) {
        expired++;
      }
    }

    return {
      financialInfo,
      businessInfo,
      environmentalInfo,
      healthInfo,
      approved,
      outstanding,
      failed,
      expired,
    };
  },
};

requireBuyer(companyQueries, 'companies');
requireBuyer(companyQueries, 'companiesExport');
requireBuyer(companyQueries, 'companyDetailExport');
requireBuyer(companyQueries, 'companiesValidatedProductsInfoExport');
requireBuyer(companyQueries, 'companiesCountByTierType');
requireBuyer(companyQueries, 'companiesCountByRegisteredVsPrequalified');
requireBuyer(companyQueries, 'companiesGenerateDueDiligenceList');
requireBuyer(companyQueries, 'companiesGenerateDifotScoreList');
requireBuyer(companyQueries, 'companiesGeneratePrequalificationList');
requireBuyer(companyQueries, 'companiesPrequalifiedStatus');

requireSupplier(companyQueries, 'companyDetailSupplierExport');

export default companyQueries;
