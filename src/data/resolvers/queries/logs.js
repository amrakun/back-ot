import { moduleRequireBuyer, requireAdmin } from '../../permissions';
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
import { fetchLogs } from '../../../data/utils';
import { LOG_TYPES } from '../../constants';

// schemas
import { BlockedCompanySchema } from '../../../db/models/BlockedCompanies';
import { CompanyRelatedSchemas } from '../../../db/models/Companies';
import { QualificationSchema } from '../../../db/models/Qualifications';
import { tenderMessageSchema } from '../../../db/models/TenderMessages';
import { TenderRelatedSchemas } from '../../../db/models/Tenders';
import { UserSchema } from '../../../db/models/Users';

// Used to show field labels in action log
const mappings = [
  {
    name: LOG_TYPES.BLOCKED_COMPANY,
    schemas: [BlockedCompanySchema],
  },
  {
    name: LOG_TYPES.COMPANY,
    schemas: [...CompanyRelatedSchemas],
  },
  {
    name: LOG_TYPES.QUALIFICATION,
    schemas: [QualificationSchema, ...CompanyRelatedSchemas],
  },
  {
    name: LOG_TYPES.TENDER_RESPONSE,
    schemas: [...TenderRelatedSchemas],
  },
  {
    name: LOG_TYPES.TENDER,
    schemas: [...TenderRelatedSchemas],
  },
  {
    name: LOG_TYPES.TENDER_MESSAGE,
    schemas: [tenderMessageSchema],
  },
  {
    name: LOG_TYPES.USER,
    schemas: [UserSchema],
  },
];

/**
 * Creates field name-label mapping list from given object
 * @param {Object} obj Object field
 */
const buildLabelList = (obj = {}) => {
  const list = [];
  const fieldNames = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field = obj[name];
    const label = field && field.label ? field.label : '';

    list.push({ name, label });
  }

  return list;
};

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

  async logsTender(root, { tenderId, page = 1, perPage = 20 }) {
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

  async logsTenderTotalCount(root, { tenderId }) {
    return TenderLogs.find({ tenderId }).count();
  },

  logs(root, params) {
    const { start, end, userId, action, page, perPage, type, desc } = params;

    return fetchLogs({
      start,
      end,
      userId,
      action,
      page,
      perPage,
      type,
      desc,
    });
  },

  /**
   * Finds db model field label according to given model type & language.
   * @param {string} param.type Model
   */
  async getDbFieldLabels(root, { type }) {
    let fieldNames = [];

    const found = mappings.find(m => m.name === type);

    if (found) {
      const schemas = found.schemas || [];

      for (const schema of schemas) {
        const names = Object.getOwnPropertyNames(schema.obj);

        for (const name of names) {
          const field = schema.obj[name];

          if (field && field.label) {
            fieldNames.push({ name, label: field.label });
          }

          // nested object field names
          if (typeof field === 'object' && field.type && field.type.obj) {
            fieldNames = fieldNames.concat(buildLabelList(field.type.obj));
          }
        }
      } // end schema for loop
    } // end schema name mapping

    return fieldNames;
  },
};

moduleRequireBuyer(logQueries);
// only admins can view logs
requireAdmin(logQueries, 'logs');
requireAdmin(logQueries, 'getDbFieldLabels');

export default logQueries;
