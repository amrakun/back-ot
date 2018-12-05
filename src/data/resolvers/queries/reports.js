import { readTemplate, generateXlsx } from '../../utils';
import { Companies, Tenders, Audits } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const reportsQuery = {
  /**
   * Supplier profile list
   * @param {Object} args - Query params
   * @param {String[]} args.productCodes - List of product codes that will be matched with
   * @param {String} args.state - Pre-qualified, not qualified, pending or all
   * @param {String} args.tierType - Tier type
   * @return {String} file url of the generated reports_suppliers.xlsx
   */
  async reportsSuppliersExport(root, { productCodes, state, tierType }, { user }) {
    const query = {};

    if (productCodes && productCodes.length > 0) {
      query.validatedProductsInfo = { $all: productCodes };
    }

    if (state !== 'all') {
      if (state === 'pending') {
        query.isPrequalified = undefined;
      } else {
        query.isPrequalified = state === 'prequalified';
      }
    }

    if (tierType) {
      query.tierType = tierType;
    }

    const suppliers = await Companies.find(query);

    const { workbook, sheet } = await readTemplate('reports_suppliers');

    let rowIndex = 2;

    for (const it of suppliers) {
      rowIndex++;

      let colIndex = 0;

      const fill = value => {
        colIndex++;
        sheet.cell(rowIndex, colIndex).value(value);
      };

      // basic info ==========
      const bi = it.basicInfo || {};

      // contact info =========
      const ci = it.contactInfo || {};

      // business info =========
      const businessInfo = it.businessInfo || {};

      fill(rowIndex - 2);
      fill(bi.sRegisteredOnSup ? 'yes' : 'no');
      fill(bi.sapNumber || '');
      fill(it.tierType || '');
      fill((it.productsInfo || []).join(','));
      fill(bi.enName || '');
      fill(bi.mnName || '');
      fill(it.averageDifotScore || 0);
      fill(it.isQualified ? 'yes' : 'no');
      fill(it.isProductsInfoValidated ? 'yes' : 'no');

      fill(ci.address || '');
      fill(ci.address2 || '');
      fill(ci.address3 || '');
      fill(ci.townOrCity || '');
      fill(`${ci.country || ''} / ${ci.province || ''}`);
      fill(ci.zipCode);

      fill(bi.registeredInCountry || '');
      fill(bi.registeredInAimag || '');
      fill(bi.registeredInSum || '');
      fill(bi.isChinese ? 'yes' : 'no');
      fill(businessInfo.isSubContractor ? 'yes' : 'no');
      fill(bi.corporateStructure || '');
      fill(bi.registrationNumber || '');
      fill((bi.certificateOfRegistration && bi.certificateOfRegistration.url) || '');

      fill(bi.website || '');

      // administrators
      fill('');

      fill(ci.phone || '');
      fill(bi.email || '');
      fill(bi.foreignOwnershipPercentage || '');

      fill(bi.totalNumberOfEmployees || 0);
      fill(bi.totalNumberOfMongolianEmployees || 0);
      fill(bi.totalNumberOfUmnugoviEmployees || 0);
    }

    // Write to file.
    return generateXlsx(user, workbook, 'reports_suppliers');
  },

  /**
   * Tender list
   * @param {Object} args - Query params
   * @param {Object} args.publishDate - Date interval object
   * @param {Date} args.publishDate.startDate - The startDate of publishDate
   * @param {Date} args.publishDate.endDate - The endDate of publishDate
   * @param {Object} args.closeDate - Date interval object
   * @param {Date} args.closeDate.startDate - The startDate of closeDate
   * @param {Date} args.closeDate.endDate - The endDate of closeDate
   * @param {String} args - Query params
   * @return {String} file url of the generated reports_tenders.xlsx
   */
  async reportsTendersExport(root, { type, publishDate, closeDate }, { user }) {
    let filter = {};

    if (publishDate) {
      filter.publishDate = {
        $gte: publishDate.startDate,
        $lte: publishDate.endDate,
      };
    }

    if (closeDate) {
      filter.closeDate = {
        $gte: closeDate.startDate,
        $lte: closeDate.endDate,
      };
    }

    if (type) {
      filter.type = type;
    }

    const tenders = await Tenders.find(filter);

    const { workbook, sheet } = await readTemplate('reports_tenders');

    let rowIndex = 4;

    for (const it of tenders) {
      rowIndex++;

      sheet.cell(rowIndex, 1).value(rowIndex - 4);
      sheet.cell(rowIndex, 2).value(it.number);
      sheet.cell(rowIndex, 3).value(it.name || '');

      const suppliers = await Companies.find({ _id: it.supplierIds }, { basicInfo: 1 });
      const supplierNames = suppliers.map(s => s.basicInfo && s.basicInfo.enName);

      sheet.cell(rowIndex, 4).value(supplierNames.join());
      sheet.cell(rowIndex, 5).value(it.sourcingOfficier);
      sheet.cell(rowIndex, 6).value(it.type);
      sheet.cell(rowIndex, 7).value(it.publishDate.toLocaleDateString());
      sheet.cell(rowIndex, 8).value(it.closeDate.toLocaleDateString());
      sheet.cell(rowIndex, 9).value(it.status);
      sheet.cell(rowIndex, 10).value(it.sentRegretLetter ? 'yes' : 'no');
    }

    // Write to file.
    return generateXlsx(user, workbook, 'reports_tenders');
  },

  /**
   * Supplier audit list
   * @param {Object} args - Query params
   * @param {Object} args.publishDate - Date interval object
   * @param {Date} args.publishDate.startDate - The startDate of publishDate
   * @param {Date} args.publishDate.endDate - The endDate of publishDate
   * @param {Object} args.closeDate - Date interval object
   * @param {Date} args.closeDate.startDate - The startDate of closeDate
   * @param {Date} args.closeDate.endDate - The endDate of closeDate
   * @param {String} args - Query params
   * @return {String} file url of the generated reports_audit_export.xlsx
   */
  async reportsAuditExport(root, { publishDate, closeDate }, { user }) {
    const { workbook, sheet } = await readTemplate('reports_audit_export');

    let filter = {};

    if (publishDate) {
      filter.publishDate = {
        $gte: publishDate.startDate,
        $lte: publishDate.endDate,
      };
    }

    if (closeDate) {
      filter.closeDate = {
        $gte: closeDate.startDate,
        $lte: closeDate.endDate,
      };
    }

    const audits = await Audits.find(filter, {
      supplierIds: 1,
      publishDate: 1,
      closeDate: 1,
      status: 1,
    });

    let index = 4;
    let rowNo = 0;

    for (let audit of audits) {
      const suppliers = await Companies.find({ _id: audit.supplierIds });

      for (let company of suppliers) {
        sheet.cell(index, 1).value(++rowNo);
        sheet.cell(index, 2).value(company.basicInfo.enName || '');
        sheet.cell(index, 3).value('desktop');
        sheet
          .cell(index, 4)
          .value((audit.publishDate && audit.publishDate.toLocaleDateString()) || '');
        sheet.cell(index, 5).value((audit.closeDate && audit.closeDate.toLocaleDateString()) || '');

        index++;
      }
    }

    return generateXlsx(user, workbook, 'reports_audit_export');
  },

  /**
   * Supplier's shareholder owner report
   * @return {String} file url of the generated reports_shareholder.xlsx
   */
  async reportsShareholder(root, { name }, { user }) {
    const { workbook, sheet } = await readTemplate('reports_shareholder');
    const suppliers = await Companies.find({});

    let index = 5;

    // is given value includes name filter
    const checkIncludes = field => {
      if (!name) {
        return true;
      }

      if (field && field.name) {
        return field.name.includes(name);
      }

      return false;
    };

    for (const supplier of suppliers) {
      let colIndex = 0;

      const fill = value => {
        colIndex++;
        sheet.cell(index, colIndex).value(value);
      };

      const bi = (await supplier.basicInfo) || {};
      const ci = (await supplier.contactInfo) || {};
      const mt = (await supplier.managementTeamInfo) || {};
      const shi = (await supplier.shareholderInfo) || { shareholders: [] };

      // check is valid ==============================
      let isValid = false;

      if (checkIncludes(ci)) {
        isValid = true;
      }

      if (
        checkIncludes(mt.managingDirector) ||
        checkIncludes(mt.executiveOfficer) ||
        checkIncludes(mt.financialDirector) ||
        checkIncludes(mt.salesDirector)
      ) {
        isValid = true;
      }

      for (const sh of shi.shareholders) {
        if (checkIncludes(sh)) {
          isValid = true;
        }
      }

      // collect only name containing suppliers
      if (!isValid) {
        continue;
      }

      // basic info ================
      fill(bi.enName);
      fill(bi.website);
      fill(bi.email);
      fill(bi.address);
      fill(bi.address2);
      fill(bi.address3);

      // contact info =================
      fill(ci.name);
      fill(ci.jobTitle);
      fill(ci.phone);
      fill(ci.phone2);
      fill(ci.email);

      // managment team info ===========
      const fillPerson = (doc = {}) => {
        fill(doc.name);
        fill(doc.jobTitle);
        fill(doc.email);
        fill(doc.phone);
      };

      fillPerson(mt.managingDirector);
      fillPerson(mt.executiveOfficer);
      fillPerson(mt.financialDirector);
      fillPerson(mt.salesDirector);

      // shareholders ===========
      for (const sh of shi.shareholders) {
        fill(sh.name);
        fill(sh.jobTitle);
        fill(sh.percentage);
      }

      index++;
    }

    return generateXlsx(user, workbook, 'reports_shareholder');
  },
};

moduleRequireBuyer(reportsQuery);

export default reportsQuery;
