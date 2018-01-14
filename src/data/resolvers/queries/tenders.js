import { Tenders, TenderResponses } from '../../../db/models';
import { readTemplate, generateXlsx } from '../../utils';
import { paginate } from './utils';
import { requireBuyer } from '../../permissions';

// TODO check permissions

const submittedTenderIds = async supplierId => {
  const submittedTenders = await TenderResponses.find({ supplierId });

  return submittedTenders.map(response => response.tenderId);
};

/*
 * Tender list & tender export helper
 */
const tenderFilter = async (args, user = {}) => {
  const { type, supplierId, ignoreSubmitted, status, search } = args;
  const query = {};

  if (type) {
    query.type = type;
  }

  query.status = {};
  query.$or = [];

  // always hide draft tenders from supplier
  if (user.isSupplier) {
    query.status.$ne = 'draft';
  }

  if (status) {
    if (status.includes('participated')) {
      query.$or.push({ _id: { $in: await submittedTenderIds(user.companyId) } });
    }

    query.$or.push({
      status: {
        $in: status
          .replace(',participated', '')
          .replace('participated,', '')
          .replace('participated', '')
          .split(','),
      },
    });
  }

  if (supplierId) {
    query.supplierIds = { $in: [supplierId] };
  }

  if (ignoreSubmitted) {
    query._id = { $nin: await submittedTenderIds(user.companyId) };
  }

  // main filter
  if (search) {
    query.$or.push({ name: new RegExp(`.*${search}.*`, 'i') });

    if (Number.isInteger(parseInt(search))) {
      query.$or.push({ number: parseInt(search) });
    }
  }

  // remove empty status query
  if (Object.keys(query.status).length === 0) {
    delete query.status;
  }

  // remove empty or query
  if (Object.keys(query.$or).length === 0) {
    delete query.$or;
  }

  return Tenders.find(query);
};

const tenderQueries = {
  /**
   * Tenders list
   * @param {Object} args - Query params
   * @return {Promise} filtered tenders list by given parameters
   */
  async tenders(root, args, { user }) {
    const tenders = await tenderFilter(args, user);

    return paginate(tenders, args);
  },

  /**
   * Export tenders
   * @param {Object} args - Query params
   * @return {String} - file url
   */
  async tendersExport(root, args, { user }) {
    const tenders = await tenderFilter(args, user);

    // read template
    const { workbook, sheet } = await readTemplate('tenders');

    let rowIndex = 1;

    for (let tender of tenders) {
      rowIndex++;

      sheet.cell(rowIndex, 1).value(tender.status);
      sheet.cell(rowIndex, 2).value(tender.number);
      sheet.cell(rowIndex, 3).value(tender.name);
      sheet.cell(rowIndex, 4).value(tender.publishDate);
      sheet.cell(rowIndex, 5).value(tender.closeDate);
      sheet.cell(rowIndex, 6).value(tender.requestedCount());
      sheet.cell(rowIndex, 7).value(await tender.submittedCount());
      sheet.cell(rowIndex, 8).value(await tender.notInterestedCount());
      sheet.cell(rowIndex, 9).value(await tender.notRespondedCount());
    }

    // Write to file.
    return generateXlsx(workbook, 'tenders');
  },

  /**
   * Get one tender
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found tender
   */
  tenderDetail(root, { _id }) {
    return Tenders.findOne({ _id });
  },
};

requireBuyer(tenderQueries, 'tendersExport');

export default tenderQueries;
