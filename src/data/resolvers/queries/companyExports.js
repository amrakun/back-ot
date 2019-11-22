/* eslint-disable max-len */

import { BlockedCompanies, Qualifications, Users } from '../../../db/models';
import { readTemplate, generateXlsx } from '../../utils';

/**
 * Export companies list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesExport = async (user, companies) => {
  // read template
  const { workbook, sheet } = await readTemplate('suppliers');
  const currentYear = new Date().getFullYear();

  let rowIndex = 1;

  sheet.cell(rowIndex, 1).value('Supplier name');
  sheet.cell(rowIndex, 2).value('Vendor number');
  sheet.cell(rowIndex, 3).value('Tier type');
  sheet.cell(rowIndex, 4).value('Pre-Qualification status');
  sheet.cell(rowIndex, 5).value('Qualification status');
  sheet.cell(rowIndex, 6).value('Validation status');
  sheet.cell(rowIndex, 7).value(`Sales revenue ${currentYear - 3}`);
  sheet.cell(rowIndex, 8).value(`Sales revenue ${currentYear - 2}`);
  sheet.cell(rowIndex, 9).value(`Sales revenue ${currentYear - 1}`);
  sheet.cell(rowIndex, 10).value('Block status');
  sheet.cell(rowIndex, 11).value('Due diligence');
  sheet.cell(rowIndex, 12).value('Difot score');
  sheet.cell(rowIndex, 13).value('Owner');
  sheet.cell(rowIndex, 14).value('Contact person');
  sheet.cell(rowIndex, 15).value('Email address');
  sheet.cell(rowIndex, 16).value('Phone number');

  const displayBool = value => {
    if (value) {
      return 'Yes';
    }

    return 'No';
  };

  for (let company of companies) {
    rowIndex++;

    const user = (await Users.findOne({ companyId: company._id })) || {};
    const basicInfo = company.basicInfo || {};
    const contactInfo = company.contactInfo || {};
    const financialInfo = company.financialInfo || {};
    const salesRevenue = financialInfo.annualTurnover || [];
    const [rev1, rev2, rev3] = salesRevenue.sort((r1, r2) => r1.year - r2.year);

    sheet.cell(rowIndex, 1).value(basicInfo.enName);
    sheet.cell(rowIndex, 2).value(basicInfo.sapNumber);
    sheet.cell(rowIndex, 3).value(company.tierTypeDisplay());
    sheet.cell(rowIndex, 4).value(company.prequalificationStatusDisplay());
    sheet.cell(rowIndex, 5).value(displayBool(company.isQualfied));
    sheet.cell(rowIndex, 6).value(displayBool(company.isProductsInfoValidated));
    sheet.cell(rowIndex, 7).value(rev1 && rev1.amount ? rev1.amount.toLocaleString() : null);
    sheet.cell(rowIndex, 8).value(rev2 && rev2.amount ? rev2.amount.toLocaleString() : null);
    sheet.cell(rowIndex, 9).value(rev3 && rev3.amount ? rev3.amount.toLocaleString() : null);
    sheet.cell(rowIndex, 10).value(displayBool(await BlockedCompanies.isBlocked(company._id)));
    sheet.cell(rowIndex, 11).value(displayBool(Boolean(company.dueDiligences)));
    sheet.cell(rowIndex, 12).value(company.averageDifotScore);
    sheet.cell(rowIndex, 13).value(user.email);
    sheet.cell(rowIndex, 14).value(contactInfo.phone);
    sheet.cell(rowIndex, 15).value(contactInfo.email);
    sheet.cell(rowIndex, 16).value(contactInfo.phone);
  }

  // Write to file.
  return generateXlsx(user, workbook, 'suppliers');
};

/**
 * Export companies list with validated products info
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesValidatedProductsInfoExport = async (user, companies) => {
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
  return generateXlsx(user, workbook, 'suppliers_products_info');
};

/**
 * Difot score list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesGenerateDifotScoreList = async (user, companies) => {
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
  return generateXlsx(user, workbook, 'difot_score');
};

/**
 * Due diligence list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesGenerateDueDiligenceList = async (user, companies) => {
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
  return generateXlsx(user, workbook, 'suppliers_due_diligence');
};

/**
 * Prequalification list
 * @param [Object] companies - filtered companies
 * @return {String} - file url
 */
export const companiesGeneratePrequalificationList = async (user, companies) => {
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
  return generateXlsx(user, workbook, 'suppliers_prequalification');
};
