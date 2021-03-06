import { readTemplate, generateXlsx } from '../../utils';
import { Companies, Tenders, TenderResponses, Audits } from '../../../db/models';
import { decryptArray, decrypt } from '../../../db/models/utils';
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

      const fillRow = productCode => {
        fill(rowIndex - 2);
        fill(bi.sRegisteredOnSup ? 'yes' : 'no');
        fill(bi.sapNumber || '');
        fill(it.tierType || '');
        fill(productCode);
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
      };

      if (it.productsInfo) {
        for (const productCode of it.productsInfo) {
          rowIndex++;
          colIndex = 0;
          fillRow(productCode);
        }
      } else {
        rowIndex++;
        fillRow('');
      }
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
    let filter = { isDeleted: { $ne: true } };

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

    const companies = await Companies.find(
      { basicInfo: { $ne: null } },
      { createdDate: 1, tierType: 1, 'basicInfo.enName': 1, 'basicInfo.mnName': 1 },
    );

    const calculateInvitedSuppliers = tender => {
      if (tender.isToAll) {
        return companies.filter(c => c.createdDate <= tender.updatedDate);
      }

      if (tender.tierTypes && tender.tierTypes.length > 0) {
        return companies.filter(
          c => c.createdDate <= tender.updatedDate && tender.tierTypes.includes(c.tierType),
        );
      }

      const supplierIds = decryptArray(tender.supplierIds);

      return companies.filter(c => supplierIds.includes(c._id.toString()));
    };

    const responses = await TenderResponses.find(
      {
        isNotInterested: { $ne: true },
        isSent: true,
      },
      { tenderId: 1, supplierId: 1 },
    );

    const participatedSupplierIdsByTenderId = {};

    for (const response of responses) {
      const tenderId = response.tenderId.toString();

      if (!participatedSupplierIdsByTenderId[tenderId]) {
        participatedSupplierIdsByTenderId[tenderId] = [];
      }

      participatedSupplierIdsByTenderId[tenderId].push(decrypt(response.supplierId));
    }

    const { workbook, sheet } = await readTemplate('reports_tenders');

    let rowIndex = 4;

    for (const it of tenders) {
      const invitedSuppliers = calculateInvitedSuppliers(it);
      const particatedSupplierIds = participatedSupplierIdsByTenderId[it._id.toString()] || [];
      const winnerIds = it.getWinnerIds();

      for (const supplier of invitedSuppliers) {
        rowIndex++;

        const supId = supplier._id.toString();
        const name = supplier.basicInfo ? supplier.basicInfo.enName : '';

        sheet.cell(rowIndex, 1).value(rowIndex - 4);
        sheet.cell(rowIndex, 2).value(it.number);
        sheet.cell(rowIndex, 3).value(it.name || '');

        sheet.cell(rowIndex, 4).value(name);
        sheet.cell(rowIndex, 5).value(particatedSupplierIds.includes(supId) ? 'yes' : 'no');
        sheet.cell(rowIndex, 6).value(winnerIds.includes(supId) ? 'yes' : 'no');
        sheet.cell(rowIndex, 7).value(it.sourcingOfficer || '');
        sheet.cell(rowIndex, 8).value(it.type);
        sheet.cell(rowIndex, 9).value(it.publishDate.toLocaleDateString());
        sheet.cell(rowIndex, 10).value(it.closeDate.toLocaleDateString());
        sheet.cell(rowIndex, 11).value(it.status);

        let isSentRegretLetter = 'no';

        if (
          it.sentRegretLetter &&
          particatedSupplierIds.includes(supId) &&
          !winnerIds.includes(supId)
        ) {
          isSentRegretLetter = 'yes';
        }

        sheet.cell(rowIndex, 12).value(isSentRegretLetter);

        sheet.cell(rowIndex, 13).value(it.cancelReason || '');
      }
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
