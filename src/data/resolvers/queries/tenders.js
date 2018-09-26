import moment from 'moment';
import { Tenders, TenderResponses } from '../../../db/models';
import { encrypt } from '../../../db/models/utils';
import { requireSupplier, requireBuyer } from '../../permissions';
import { paginate } from './utils';
import { tendersExport, tenderGenerateMaterialsTemplate } from './tenderExports';

/*
 * Tender list & tender export helper
 */
const tendersFilter = async (args, extraChecks) => {
  const { type, status, search, month } = args;

  const query = { $and: [] };

  // type: rfq, eoi
  if (type) {
    query.$and.push({ type });
  }

  // status filter
  if (status) {
    query.$and.push({ status: { $in: status.split(',') } });
  }

  // main filter
  if (search) {
    const tenders = await Tenders.find({});

    const filtered = tenders.filter(({ name, number }) => {
      return name.includes(search) || number.includes(search);
    });

    const ids = filtered.map(tender => tender._id);

    query.$and.push({ _id: { $in: ids } });
  }

  // month filter: month is date object
  if (month) {
    query.$and.push({
      createdDate: {
        $gt: moment(month)
          .startOf('month')
          .toDate(),
        $lte: moment(month)
          .endOf('month')
          .toDate(),
      },
    });
  }

  // do some extra checks
  extraChecks && (await extraChecks(query));

  // remove empty $and selector
  if (Object.keys(query.$and).length === 0) {
    delete query.$and;
  }

  return query;
};

/*
 * Buyer only filters
 */
const tendersBuyerFilter = async (args, user) =>
  tendersFilter(args, query => {
    if (user.role !== 'admin') {
      query.$and.push({ createdUserId: user._id });
    }
  });

/**
 * Supplier only filters
 */
const tendersSupplierFilter = async (args, user) => {
  const { status } = args;

  // removing status filter to implement custom status filter
  // below
  delete args.status;

  const query = await tendersFilter(args, async query => {
    query.$and.push({ supplierIds: { $in: [encrypt(user.companyId)] } });
    query.$and.push({ status: { $ne: 'draft' } });

    // ignore not interested tenders =============
    const notInterestedTenders = await TenderResponses.find({
      supplierId: encrypt(user.companyId),
      isNotInterested: true,
    });

    const notInterestedTenderIds = notInterestedTenders.map(res => res.tenderId);

    query.$and.push({ _id: { $nin: notInterestedTenderIds } });

    // status filter ==========
    if (status) {
      const isParticipated = status.includes('participated');

      // exclude participated and empty values
      const statuses = status.split(',').filter(s => !['', 'participated'].includes(s));

      // generate status filter depending on statuses length
      const statusFilter = statuses.length > 0 ? { status: { $in: statuses } } : {};

      // filter only user's responded tenders
      if (isParticipated) {
        const submittedTenders = await TenderResponses.find({
          supplierId: encrypt(user.companyId),
        });

        const submittedTenderIds = submittedTenders.map(res => res.tenderId);
        const submittedFilter = { _id: { $in: submittedTenderIds } };

        query.$and.push({ ...submittedFilter, ...statusFilter });
      } else {
        query.$and.push(statusFilter);
      }
    }
  });

  return query;
};

const tenderQueries = {
  /**
   * Tenders list for buyer
   * @param {Object} args - Query params
   * @return {Promise} filtered tenders list by given parameters
   */
  async tenders(root, args, { user }) {
    const query = await tendersBuyerFilter(args, user);

    return paginate(Tenders.find(query).sort({ createdDate: -1 }), args);
  },

  /**
   * Buyer tenders total count
   * @param {Object} args - Query params
   * @return {Promise} count
   */
  async tendersBuyerTotalCount(root, args, { user }) {
    const query = await tendersBuyerFilter(args, user);

    return Tenders.find(query).count();
  },

  /**
   * Tenders list for supplier
   * @param {Object} args - Query params
   * @return {Promise} filtered tenders list by given parameters
   */
  async tendersSupplier(root, args, { user }) {
    const query = await tendersSupplierFilter(args, user);

    return paginate(Tenders.find(query).sort({ createdDate: -1 }), args);
  },

  /**
   * Supplier tenders total count
   * @param {Object} args - Query params
   * @return {Promise} count
   */
  async tendersSupplierTotalCount(root, args, { user }) {
    const query = await tendersSupplierFilter(args, user);

    return Tenders.find(query).count();
  },

  /**
   * Export tenders
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async tendersExport(root, args, { user }) {
    const query = await tendersBuyerFilter(args, user);

    const tenders = await Tenders.find(query).sort({ createdDate: -1 });

    return tendersExport(tenders);
  },

  /**
   * Generate tender materials template for supplier
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async tenderGenerateMaterialsTemplate(root, { tenderId }) {
    const tender = await Tenders.findOne({ _id: tenderId });

    return tenderGenerateMaterialsTemplate(tender);
  },

  /**
   * Get one tender for buyer
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found tender
   */
  tenderDetail(root, { _id }) {
    return Tenders.findOne({ _id });
  },

  /**
   * Get one tender for supplier
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found tender
   */
  async tenderDetailSupplier(root, { _id }, { user }) {
    return Tenders.findOne({ _id, supplierIds: { $in: [encrypt(user.companyId)] } });
  },

  /*
   * Tender counts by status
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {String} type - Eoi or rfq
   * @return - Generated doc
   */
  async tenderCountByStatus(root, { startDate, endDate, type }, { user }) {
    // find tenders =========
    const query = {
      publishDate: { $gte: startDate, $lte: endDate },
      type,
    };

    // show all tenders to only admin
    if (user.role !== 'admin') {
      query.createdUserId = user._id;
    }

    const tenders = await Tenders.find(query);

    const results = {};

    for (let tender of tenders) {
      // 1/25/2018
      const key = tender.publishDate.toLocaleDateString();

      // if key is not exists then create
      if (!results[key]) {
        results[key] = { open: 0, closed: 0 };
      }

      // increment open count
      if (tender.status === 'open') {
        results[key].open += 1;
      }

      // increment closed count
      if (tender.status === 'closed') {
        results[key].closed += 1;
      }
    }

    // {
    // '1/25/2018': { open: 1, closed: 0 },
    // '1/26/2018': { open: 1, closed: 1 }
    // }
    return results;
  },

  /*
   * Tender counts by type
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {String} type - Eoi or rfq
   * @return - Total count
   */
  tendersTotalCountReport(root, { startDate, endDate, type }, { user }) {
    const query = {
      publishDate: { $gte: startDate, $lte: endDate },
      type,
    };

    // show all tenders to only admin
    if (user.role !== 'admin') {
      query.createdUserId = user._id;
    }

    return Tenders.find(query).count();
  },

  /*
   * Count tenders's days between publish & close dates
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {String} type - Eoi or rfq
   * @return - Total count
   */
  async tendersAverageDuration(root, { startDate, endDate, type }, { user }) {
    // find tenders =============
    const query = {
      publishDate: { $gte: startDate, $lte: endDate },
      type,
    };

    // show all tenders to only admin
    if (user.role !== 'admin') {
      query.createdUserId = user._id;
    }

    const tenders = await Tenders.find(query);

    // collect durations ====================
    const durations = [];

    for (const tender of tenders) {
      const publishDate = moment(tender.publishDate);
      const closeDate = moment(tender.closeDate);

      durations.push(closeDate.diff(publishDate, 'days'));
    }

    // calculate average duration ========
    const sum = durations.reduce((previous, current) => (current += previous), 0);

    return sum / durations.length;
  },
};

requireSupplier(tenderQueries, 'tendersSupplier');
requireSupplier(tenderQueries, 'tendersSupplierTotalCount');
requireSupplier(tenderQueries, 'tenderDetailSupplier');

requireBuyer(tenderQueries, 'tenders');
requireBuyer(tenderQueries, 'tendersBuyerTotalCount');
requireBuyer(tenderQueries, 'tendersTotalCountReport');
requireBuyer(tenderQueries, 'tendersExport');
requireBuyer(tenderQueries, 'tenderDetail');
requireBuyer(tenderQueries, 'tenderCountByStatus');
requireBuyer(tenderQueries, 'tendersAverageDuration');

export default tenderQueries;
