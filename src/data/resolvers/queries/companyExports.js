/* eslint-disable max-len */

import { BlockedCompanies, Qualifications } from '../../../db/models';
import { readTemplate, generateXlsx } from '../../utils';

/**
 * Export companies list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesExport = async companies => {
  // read template
  const { workbook, sheet } = await readTemplate('suppliers');

  let rowIndex = 1;

  for (let company of companies) {
    rowIndex++;

    const basicInfo = company.basicInfo || {};
    const contactInfo = company.contactInfo || {};

    sheet.cell(rowIndex, 1).value(basicInfo.enName);
    sheet.cell(rowIndex, 2).value(basicInfo.sapNumber);
    sheet.cell(rowIndex, 3).value(company.isSentRegistrationInfo);
    sheet.cell(rowIndex, 4).value(company.isPrequalified);
    sheet.cell(rowIndex, 5).value(company.isQualfied);
    sheet.cell(rowIndex, 6).value(company.isProductsInfoValidated);
    sheet.cell(rowIndex, 7).value(Boolean(company.dueDiligences));
    sheet.cell(rowIndex, 8).value(company.averageDifotScore);
    sheet.cell(rowIndex, 9).value(await BlockedCompanies.isBlocked(company._id));
    sheet.cell(rowIndex, 11).value(contactInfo.email);
    sheet.cell(rowIndex, 12).value(contactInfo.phone);
  }

  // Write to file.
  return generateXlsx(workbook, 'suppliers');
};

/**
 * Export companies list with validated products info
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesValidatedProductsInfoExport = async companies => {
  // read template
  const { workbook, sheet } = await readTemplate('suppliers_products_info');

  let rowIndex = 1;

  for (let company of companies) {
    rowIndex++;

    const basicInfo = company.basicInfo || {};
    const contactInfo = company.contactInfo || {};

    const total = company.productsInfo.length;
    const validated = company.validatedProductsInfo.length;

    const lastProductsInfoValidation = company.getLastProductsInfoValidation() || {};

    let lastDate = '';

    if (lastProductsInfoValidation.date) {
      lastDate = new Date(lastProductsInfoValidation.date).toLocaleDateString();
    }

    sheet.cell(rowIndex, 1).value(basicInfo.enName);
    sheet.cell(rowIndex, 2).value(basicInfo.sapNumber);
    sheet.cell(rowIndex, 3).value(company.tierType);
    sheet.cell(rowIndex, 4).value(company.isProductsInfoValidated);
    sheet.cell(rowIndex, 5).value(`Total: ${total} | Validated: ${validated}`);
    sheet.cell(rowIndex, 6).value(lastDate);
    sheet.cell(rowIndex, 7).value(company.isProductsInfoValidated);
    sheet.cell(rowIndex, 9).value(contactInfo.email);
    sheet.cell(rowIndex, 10).value(contactInfo.phone);
  }

  // Write to file.
  return generateXlsx(workbook, 'suppliers_products_info');
};

/**
 * Difot score list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesGenerateDifotScoreList = async companies => {
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
};

/**
 * Due diligence list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesGenerateDueDiligenceList = async companies => {
  // read template
  const { workbook, sheet } = await readTemplate('suppliers_due_diligence');

  let rowIndex = 1;

  for (let company of companies) {
    rowIndex++;

    const basicInfo = company.basicInfo || {};
    const contactInfo = company.contactInfo || {};

    const lastDueDiligence = company.getLastDueDiligence();

    sheet.cell(rowIndex, 1).value(basicInfo.enName);
    sheet.cell(rowIndex, 2).value(basicInfo.sapNumber);
    sheet.cell(rowIndex, 3).value(company.tierType);

    sheet.cell(rowIndex, 4).value(lastDueDiligence ? 'YES' : 'NO');

    if (lastDueDiligence) {
      sheet.cell(rowIndex, 5).value(lastDueDiligence.file.url);
      sheet.cell(rowIndex, 6).value(new Date(lastDueDiligence.date).toLocaleDateString());
    }

    sheet.cell(rowIndex, 7).value('');
    sheet.cell(rowIndex, 8).value(contactInfo.email);
    sheet.cell(rowIndex, 9).value(contactInfo.phone);
  }

  // Write to file.
  return generateXlsx(workbook, 'suppliers_due_diligence');
};

/**
 * Prequalification list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesGeneratePrequalificationList = async companies => {
  // read template
  const { workbook, sheet } = await readTemplate('suppliers_prequalification');

  let rowIndex = 4;

  /*
   * Check per sections' all values are true
   */
  const isSectionPassed = sectionSchema => {
    const isPassed = Qualifications.isSectionPassed(sectionSchema);

    return isPassed ? 'Passed' : 'Failed';
  };

  const fillCell = (rowIndex, colIndex, value) => {
    sheet
      .cell(rowIndex, colIndex)
      .style({ horizontalAlignment: 'left' })
      .value(value);
  };

  for (let company of companies) {
    const qualification = await Qualifications.findOne({ supplierId: company._id });

    rowIndex++;

    const basicInfo = company.basicInfo || {};

    const fill = async ({ businessInfo, healthInfo, environmentalInfo, financialInfo }) => {
      const expiryDate = await Qualifications.getExpiryDate(company._id);

      fillCell(rowIndex, 1, basicInfo.enName);
      fillCell(rowIndex, 2, basicInfo.sapNumber);
      fillCell(rowIndex, 3, businessInfo);
      fillCell(rowIndex, 4, healthInfo);
      fillCell(rowIndex, 5, environmentalInfo);
      fillCell(rowIndex, 6, financialInfo);
      fillCell(rowIndex, 7, company.prequalificationStatusDisplay());
      fillCell(rowIndex, 8, expiryDate ? expiryDate.toLocaleDateString() : '');
      fillCell(rowIndex, 9, company.tierTypeDisplay());
    };

    if (qualification) {
      await fill({
        businessInfo: isSectionPassed(qualification.businessInfo),
        healthInfo: isSectionPassed(qualification.healthInfo),
        environmentalInfo: isSectionPassed(qualification.environmentalInfo),
        financialInfo: isSectionPassed(qualification.financialInfo),
      });

      continue;
    }

    await fill({
      businessInfo: 'Outstanding',
      healthInfo: 'Outstanding',
      environmentalInfo: 'Outstanding',
      financialInfo: 'Outstanding',
    });
  }

  // Write to file.
  return generateXlsx(workbook, 'suppliers_prequalification');
};
