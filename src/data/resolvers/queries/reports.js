import { readTemplate, generateXlsx } from '../../utils';
import { Companies, Tenders } from '../../../db/models';

const updateFilter = (filter, additionalFilter) => ({ ...filter, ...additionalFilter });
const getBasicInfo = (obj, key) => (obj.basicInfo && obj.basicInfo[key] ? obj.basicInfo[key] : '');
const getBasicInfoAsInt = (obj, key) =>
  obj.basicInfo && obj.basicInfo[key] ? obj.basicInfo[key] : 0;
const getBasicInfoAsBoolean = (obj, key) =>
  obj.basicInfo && obj.basicInfo[key] && obj.basicInfo[key] === true ? true : false;

const reportsSuppliersQuery = {
  async reportsSuppliersExport(root, { productCode, isPrequalified }) {
    let filter = {};

    if (productCode) {
      filter =
        productCode.length > 0
          ? updateFilter(filter, { validatedProductsInfo: { $all: productCode } })
          : filter;
    }

    if (typeof isPrequalified === 'boolean') {
      filter = updateFilter(filter, { isPrequalified });
    }

    const suppliers = await Companies.find(filter);

    const { workbook, sheet } = await readTemplate('reports_suppliers');

    let rowIndex = 1;

    for (let it of suppliers) {
      rowIndex++;

      sheet.cell(rowIndex, 1).value(getBasicInfoAsBoolean(it, 'isRegisteredOnSup'));
      sheet.cell(rowIndex, 2).value(getBasicInfo(it, 'sapNumber'));
      sheet.cell(rowIndex, 3).value(getBasicInfo(it, 'enName'));
      sheet.cell(rowIndex, 4).value(getBasicInfo(it, 'mnName'));
      sheet.cell(rowIndex, 5).value(getBasicInfo(it, 'averageDifotScore'));

      sheet
        .cell(rowIndex, 6)
        .value(getBasicInfoAsBoolean(it, 'isProductsInfoValidated') ? 'yes' : 'no');
      sheet.cell(rowIndex, 7).value(getBasicInfo(it, 'address'));
      sheet.cell(rowIndex, 8).value(getBasicInfo(it, 'address2'));
      sheet.cell(rowIndex, 9).value(getBasicInfo(it, 'address3'));
      sheet.cell(rowIndex, 10).value(getBasicInfo(it, 'townOrCity'));

      sheet.cell(rowIndex, 11).value(getBasicInfo(it, 'country'));
      sheet.cell(rowIndex, 12).value(getBasicInfo(it, 'province'));

      sheet.cell(rowIndex, 13).value(getBasicInfo(it, 'registeredInCountry'));
      sheet.cell(rowIndex, 14).value(getBasicInfo(it, 'registeredInAimag'));
      sheet.cell(rowIndex, 15).value(getBasicInfo(it, 'registeredInSum'));

      sheet.cell(rowIndex, 16).value(getBasicInfoAsBoolean(it, 'isChinese'));
      sheet.cell(rowIndex, 17).value(getBasicInfoAsInt(it, 'registrationNumber'));

      sheet
        .cell(rowIndex, 18)
        .value(
          (it &&
            it.basicInfo.certificateOfRegistration &&
            it.basicInfo.certificateOfRegistration.name &&
            it.basicInfo.certificateOfRegistration.url) ||
            '',
        );

      sheet.cell(rowIndex, 19).value(getBasicInfo(it, 'website'));
      sheet.cell(rowIndex, 20).value(it.contactInfo ? it.contactInfo.phone : '');
      sheet.cell(rowIndex, 21).value(getBasicInfo(it, 'email'));
      sheet.cell(rowIndex, 22).value(getBasicInfo(it, 'foreignOwnershipPercentage'));

      sheet.cell(rowIndex, 23).value(getBasicInfoAsInt(it, 'totalNumberOfEmployees'));
      sheet.cell(rowIndex, 24).value(getBasicInfoAsInt(it, 'totalNumberOfMongolianEmployees'));
      sheet.cell(rowIndex, 25).value(getBasicInfoAsInt(it, 'totalNumberOfUmnugoviEmployees'));
    }

    // Write to file.
    return generateXlsx(workbook, 'reports_suppliers');
  },

  async reportsTendersExport(root, { type, publishDate, closeDate }) {
    const filter = {};

    await Tenders.find(filter);

    return 'test';
  },
};

export default reportsSuppliersQuery;
