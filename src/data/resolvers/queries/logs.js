import { moduleRequireBuyer } from '../../permissions';
import { TenderLogs } from '../../../db/models';
import {
  buildSupplierLoginsLog,
  buildBuyerLoginsLog,
  buildSupplierLoginsByEoiSubmissions,
  buildSupplierLoginsByRfqSubmissions,
  buildSearchesPerBuyer,
  buildEoiCreatedAndSentExport,
  buildRfqCreatedAndSentExport,
  buildSuppliersByProductCodeLogsExport,
  buildActivityLogsExport,
} from './logExports';

const logQueries = {
  async logsSupplierLoginsExport(root, { startDate, endDate }, { user }) {
    return buildSupplierLoginsLog(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsBuyerLoginsExport(root, { startDate, endDate }, { user }) {
    return buildBuyerLoginsLog(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsSupplierLoginsByEoiSubmissionsExport(root, { startDate, endDate }, { user }) {
    return buildSupplierLoginsByEoiSubmissions(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsSupplierLoginsByRfqSubmissionsExport(root, { startDate, endDate }, { user }) {
    return buildSupplierLoginsByRfqSubmissions(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsSearchesPerBuyerExport(root, { startDate, endDate }, { user }) {
    return buildSearchesPerBuyer(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsEoiCreatedAndSentExport(root, { startDate, endDate }, { user }) {
    return buildEoiCreatedAndSentExport(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsRfqCreatedAndSentExport(root, { startDate, endDate }, { user }) {
    return buildRfqCreatedAndSentExport(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user,
    );
  },

  async logsSuppliersByProductCodeLogsExport(root, { startDate, endDate, productCodes }, { user }) {
    return buildSuppliersByProductCodeLogsExport(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        productCodes,
      },
      user,
    );
  },

  async logsActivityLogsExport(root, { startDate, endDate, module }, { user }) {
    return buildActivityLogsExport(
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        module,
      },
      user,
    );
  },

  async logsTenders(root, { tenderId, page = 1, perPage = 20 }) {
    const query = {};

    if (tenderId) {
      query.tenderId = tenderId;
    }

    const docs = await TenderLogs.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return docs;
  },

  async logsTenderDetail(root, { _id }) {
    return TenderLogs.findOne({ _id });
  },

  async logsTenderCount(root, { tenderId }) {
    return TenderLogs.find({ tenderId }).count();
  },
};

moduleRequireBuyer(logQueries);

export default logQueries;
