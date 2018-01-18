import { readTemplate, generateXlsx } from '../../utils';
import { Companies, Tenders } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const reportsSuppliersQuery = {
  /**
   * Supplier list
   * @param {Object} args - Query params
   * @param {String[]} args.productCodes - List of product codes that will be matched with
   * @param {boolean} args.isPrequalified - Company isPrequalified field
   * @return {String} file url of the generated reports_suppliers.xlsx
   */
  async reportsSuppliersExport(root, { productCodes, isPrequalified }) {
    const filter = {};

    if (productCodes && productCodes.length > 0) {
      filter.validatedProductsInfo = { $all: productCodes };
    }

    if (typeof isPrequalified === 'boolean') {
      filter.isPrequalified = isPrequalified;
    }

    const suppliers = await Companies.find(filter);

    const { workbook, sheet } = await readTemplate('reports_suppliers');

    let rowIndex = 1;

    for (let it of suppliers) {
      rowIndex++;

      const basicInfo = it.basicInfo || {};

      sheet.cell(rowIndex, 1).value(basicInfo.sRegisteredOnSup || false);
      sheet.cell(rowIndex, 2).value(basicInfo.sapNumber || '');
      sheet.cell(rowIndex, 3).value(basicInfo.enName || '');
      sheet.cell(rowIndex, 4).value(basicInfo.mnName || '');
      sheet.cell(rowIndex, 5).value(basicInfo.averageDifotScore || '');

      sheet.cell(rowIndex, 6).value(basicInfo.isProductsInfoValidated ? 'yes' : 'no');

      sheet.cell(rowIndex, 7).value(basicInfo.address || '');
      sheet.cell(rowIndex, 8).value(basicInfo.address2 || '');
      sheet.cell(rowIndex, 9).value(basicInfo.address3 || '');
      sheet.cell(rowIndex, 10).value(basicInfo.townOrCity || '');

      sheet.cell(rowIndex, 11).value(basicInfo.country || '');
      sheet.cell(rowIndex, 12).value(basicInfo.province || '');

      sheet.cell(rowIndex, 13).value(basicInfo.registeredInCountry || '');
      sheet.cell(rowIndex, 14).value(basicInfo.registeredInAimag || '');
      sheet.cell(rowIndex, 15).value(basicInfo.registeredInSum || '');

      sheet.cell(rowIndex, 16).value(basicInfo.isChinese ? 'yes' : 'no');
      sheet.cell(rowIndex, 17).value(basicInfo.registrationNumber || 0);

      sheet
        .cell(rowIndex, 18)
        .value(
          (basicInfo.certificateOfRegistration && basicInfo.certificateOfRegistration.url) || '',
        );

      sheet.cell(rowIndex, 19).value(basicInfo.website || '');
      sheet.cell(rowIndex, 20).value((it.contactInfo && it.contactInfo.phone) || '');
      sheet.cell(rowIndex, 21).value(basicInfo.email || '');
      sheet.cell(rowIndex, 22).value(basicInfo.foreignOwnershipPercentage || '');

      sheet.cell(rowIndex, 23).value(basicInfo.totalNumberOfEmployees || 0);
      sheet.cell(rowIndex, 24).value(basicInfo.totalNumberOfMongolianEmployees || 0);
      sheet.cell(rowIndex, 25).value(basicInfo.totalNumberOfUmnugoviEmployees || 0);
    }

    // Write to file.
    return generateXlsx(workbook, 'reports_suppliers');
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
  async reportsTendersExport(root, { type, publishDate, closeDate }) {
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

    let rowIndex = 1;

    for (let it of tenders) {
      rowIndex++;

      sheet.cell(rowIndex, 1).value(rowIndex);
      sheet.cell(rowIndex, 2).value(it.number);
      sheet.cell(rowIndex, 3).value(it.name || '');

      let suppliers = [];
      for (let supplier of await Companies.find({ _id: it.supplierIds }, { enName: 1 })) {
        suppliers.push(supplier.enName);
      }

      sheet.cell(rowIndex, 4).value(suppliers.join());
      sheet.cell(rowIndex, 5).value(it.type);
      sheet.cell(rowIndex, 6).value(it.publishDate.toString());
      sheet.cell(rowIndex, 7).value(it.closeDate.toString());
      sheet.cell(rowIndex, 8).value(it.status);
      sheet.cell(rowIndex, 9).value(it.sentRegretLetter ? 'yes' : 'no');
    }

    // Write to file.
    return generateXlsx(workbook, 'reports_tenders');
  },
};

moduleRequireBuyer(reportsSuppliersQuery);

export default reportsSuppliersQuery;
