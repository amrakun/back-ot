/* eslint-disable max-len */

import cf from 'cellref';
import { BlockedCompanies, Qualifications } from '../../../db/models';
import { readTemplate, generateXlsx } from '../../utils';

export const companyRegistrationExport = async supplier => {
  const { workbook } = await readTemplate('company_detail_export');

  const sheetA = workbook.sheet(0);

  const basicInfo = supplier.basicInfo || {};
  const contactInfo = supplier.contactInfo || {};
  const managementTeamInfo = supplier.managementTeamInfo || {};
  const shareholderInfo = supplier.shareholderInfo || {};
  const groupInfo = supplier.groupInfo || {};
  const certificateInfo = supplier.certificateInfo || {};

  let index = 1;

  sheetA.column('B').width(40);
  sheetA.column('C').width(40);

  const fillValue = (sheet, title, value, fill) => {
    const style = {
      horizontalAlignment: 'left',
      wrapText: true,
    };

    if (fill) {
      style.fill = fill;
      style.fontColor = 'ffffff';
    }

    sheet
      .cell(index, 2)
      .style(style)
      .value(title);
    sheet
      .cell(index, 3)
      .style(style)
      .value(value || '');

    index++;
  };

  const fillSection = (sheet, title) => {
    sheet
      .range(`${cf(`R${index}C2`)}:${cf(`R${index}C3`)}`)
      .merged(true)
      .style({
        horizontalAlignment: 'center',
        fill: 'f47721',
        fontColor: 'ffffff',
        bold: true,
      })
      .value(title);
    index++;
  };

  const fillAValue = (...args) => fillValue(sheetA, ...args);
  const fillASection = title => fillSection(sheetA, title);

  fillAValue('Company name (English)', basicInfo.enName, '2496a9');
  fillAValue('Vendor number', basicInfo.sapNumber, '2496a9');
  fillAValue('Tier type', supplier.tierType, '2496a9');

  fillASection('Section 1. Company Information');

  fillAValue('Address', '');
  fillAValue('Address Line 1', basicInfo.address);
  fillAValue('Address Line 2', basicInfo.address2);
  fillAValue('Address Line 3', basicInfo.address3);
  fillAValue('Town or city', basicInfo.townOrCity);
  fillAValue('Province', basicInfo.province);
  fillAValue('Zip code', basicInfo.zipCode);
  fillAValue('Country', basicInfo.country);
  fillAValue('Registered in country', basicInfo.registeredInCountry);
  fillAValue('Registered in aimag', basicInfo.registeredInAimag);
  fillAValue('Registered in sum', basicInfo.registeredInSum);
  fillAValue('Is Chinese state owned entity', basicInfo.isChinese ? 'yes' : 'no');
  fillAValue('Is registered sub-contractor', basicInfo.isSubcontractor ? 'yes' : 'no');
  fillAValue('Closest matching corporate structure', basicInfo.corporateStructure);
  fillAValue('Company Registration Number', basicInfo.registrationNumber);
  fillAValue(
    'Certificate of Registration',
    basicInfo.certificateOfRegistration ? basicInfo.certificateOfRegistration.url : '',
  );
  fillAValue('Company web site', basicInfo.website);
  fillAValue('Company email address', basicInfo.email);
  fillAValue('Foreign ownership percentage', basicInfo.foreignOwnershipPercentage);
  fillAValue('Total number of employees', basicInfo.totalNumberOfEmployees);
  fillAValue('Total number of mongolian employees', basicInfo.totalNumberOfMongolianEmployees);
  fillAValue('Total number of Umnugovi employees', basicInfo.totalNumberOfUmnugoviEmployees);

  // contact details =====================
  fillASection('Section 2. Contact Details');

  fillAValue('Name', contactInfo.name);
  fillAValue('Job title', contactInfo.jobTitle);
  fillAValue('Address', contactInfo.address);
  fillAValue('Address 2', contactInfo.address2);
  fillAValue('Address 3', contactInfo.address3);
  fillAValue('Phone', contactInfo.phone);
  fillAValue('Phone 2', contactInfo.phone2);
  fillAValue('Email address', contactInfo.email);

  // management team =====================
  fillASection('Section 3. Management Team');

  const renderManagementTeam = (title, value) => {
    sheetA.cell(index, 2).value(title);
    index++;

    fillAValue('Name', value.name);
    fillAValue('Job title', value.jobTitle);
    fillAValue('Phone', value.phone);
    fillAValue('Email', value.email);
  };

  const {
    managingDirector = {},
    executiveOfficer = {},
    salesDirector = {},
    financialDirector = {},
  } = managementTeamInfo;

  renderManagementTeam('Managing Director', managingDirector);
  renderManagementTeam('Executive Officer', executiveOfficer);
  renderManagementTeam('Sales Director', salesDirector);
  renderManagementTeam('Financial Director', financialDirector);

  const renderOtherMember = (title, value) => {
    sheetA.cell(index, 2).value(title);
    index++;

    fillAValue('Name', value.name);
    fillAValue('Job title', value.jobTitle);
    fillAValue('Phone', value.phone);
    fillAValue('Email', value.email);
  };

  const otherMember1 = managementTeamInfo.otherMember1;
  const otherMember2 = managementTeamInfo.otherMember2;
  const otherMember3 = managementTeamInfo.otherMember3;

  if (otherMember1) {
    renderOtherMember('Other member 1', otherMember1);
  }

  if (otherMember2) {
    renderOtherMember('Other member 2', otherMember2);
  }

  if (otherMember3) {
    renderOtherMember('Other member 3', otherMember3);
  }

  // company shareholders ===============
  const shareholders = shareholderInfo.shareholders || [];

  fillASection('Section 4. Company Shareholder Information');

  for (let shareholder of shareholders) {
    fillAValue('Name', shareholder.name);
    fillAValue('Job title', shareholder.jobTitle);
    fillAValue('Share percentage', shareholder.percentage || 0);
  }

  // groupInfo ===================
  fillASection('Section 5. Group Information');

  fillAValue('Has a parent company', groupInfo.hasParent ? 'yes' : 'no');
  fillAValue('Parent company is existing supplier?', groupInfo.isParentExistingSup ? 'yes' : 'no');
  fillAValue('Parent company name', groupInfo.parentName);
  fillAValue('Parent company address', groupInfo.parentAddress);
  fillAValue('Registration number of parent company', groupInfo.parentRegistrationNumber);
  fillAValue('Company role', groupInfo.role);

  if (groupInfo.role == 'EOM') {
    sheetA.cell(index, 2).value('Factory name');
    sheetA.cell(index, 3).value('Town or City');
    sheetA.cell(index, 4).value('Country');
    sheetA.cell(index, 5).value('Associated Product');
    index++;

    for (let factory of groupInfo.factories || []) {
      sheetA.cell(index, 2).value(factory.name || '');
      sheetA.cell(index, 3).value(factory.townOrCity || '');
      sheetA.cell(index, 4).value(factory.country || '');
      sheetA.cell(index, 5).value(factory.productCodes || '');
      index++;
    }
  }

  fillAValue('Is exclusive distributor?', groupInfo.isExclusiveDistributor ? 'yes' : 'no');
  fillAValue('Primary manufacturer name', groupInfo.primaryManufacturerName);
  fillAValue('Country of primary manufacture', groupInfo.countryOfPrimaryManufacturer);

  // Product and Services ==========
  fillASection('Section 6. Product and Services');

  fillAValue('Product/Service code', (supplier.productsInfo || []).join());

  // Capacity building certificate ===============
  fillASection('Capacity building certificate');

  fillAValue('Company received capacity building certificate', certificateInfo.description);
  fillAValue(
    'Certificate url',
    (certificateInfo && certificateInfo.file && certificateInfo.file.url) || '',
  );

  return generateXlsx(workbook, 'company_detail_export');
};

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
