/* eslint-disable max-len */

import cf from 'cellref';
import { BlockedCompanies, Qualifications } from '../../../db/models';
import { readTemplate, generateXlsx } from '../../utils';

export const companyDetailExport = async supplier => {
  const { workbook } = await readTemplate('company_detail_export');

  const sheetA = workbook.sheet(0);
  const sheetB = workbook.sheet(1);
  const sheetC = workbook.sheet(2);
  const sheetD = workbook.sheet(3);
  const sheetE = workbook.sheet(4);

  const basicInfo = supplier.basicInfo || {};
  const contactInfo = supplier.contactInfo || {};
  const managementTeamInfo = supplier.managementTeamInfo || {};
  const shareholderInfo = supplier.shareholderInfo || {};
  const groupInfo = supplier.groupInfo || {};
  const certificateInfo = supplier.certificateInfo || {};
  const financialInfo = supplier.financialInfo || {};
  const businessInfo = supplier.businessInfo || {};
  const environmentalInfo = supplier.environmentalInfo || {};
  const healthInfo = supplier.healthInfo || {};

  let index = 1;

  sheetA.column('B').width(40);
  sheetA.column('C').width(40);

  const fillAValue = (title, value, fill) => {
    const style = {
      horizontalAlignment: 'left',
      wrapText: true,
    };

    if (fill) {
      style.fill = fill;
      style.fontColor = 'ffffff';
    }

    sheetA
      .cell(index, 2)
      .style(style)
      .value(title);
    sheetA
      .cell(index, 3)
      .style(style)
      .value(value || '');
    index++;
  };

  const fillASection = title => {
    sheetA
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

  // Financial Information ==========
  index = 1;
  sheetB.cell(index, 2).value('Financial Information');

  index = index + 2;
  sheetB.cell(index, 2).value('Accounts for last 3 years');
  sheetB.cell(index, 4).value(financialInfo.canProvideAccountsInfo ? 'yes' : 'no');

  index = index + 2;
  sheetB.cell(index, 2).value('Reasons');
  sheetB.cell(index, 4).value(financialInfo.reasonToCannotNotProvide || '');

  index = index + 2;
  sheetB.cell(index, 2).value('Currency');
  sheetB.cell(index, 4).value(financialInfo.currency || '');

  index = index + 3;
  sheetB.cell(index, 2).value('Annual Turnover');
  for (let annualTurnover of financialInfo.annualTurnover || []) {
    ++index;
    sheetB.cell(index, 2).value(annualTurnover.year);
    sheetB.cell(index, 3).value(annualTurnover.amount);
  }

  index = index + 3;
  sheetB.cell(index, 2).value('Annual Turnover');
  for (let preTaxProfit of financialInfo.preTaxProfit || []) {
    ++index;
    sheetB.cell(index, 2).value(preTaxProfit.year);
    sheetB.cell(index, 3).value(preTaxProfit.amount);
  }

  index = index + 3;
  sheetB.cell(index, 2).value('Total Assets');
  for (let totalAssets of financialInfo.totalAssets || []) {
    ++index;
    sheetB.cell(index, 2).value(totalAssets.year);
    sheetB.cell(index, 3).value(totalAssets.amount);
  }

  index = index + 3;
  sheetB.cell(index, 2).value('Total Current Assets');
  for (let totalCurrentAssets of financialInfo.totalCurrentAssets || []) {
    ++index;
    sheetB.cell(index, 2).value(totalCurrentAssets.year);
    sheetB.cell(index, 3).value(totalCurrentAssets.amount);
  }

  index = index + 3;
  sheetB.cell(index, 2).value('Total Short Term Liabilities');

  index = index + 3;
  sheetB.cell(index, 2).value("Total Shareholder's Equity");
  for (let totalShareholderEquity of financialInfo.totalShareholderEquity || []) {
    ++index;
    sheetB.cell(index, 2).value(totalShareholderEquity.year);
    sheetB.cell(index, 3).value(totalShareholderEquity.amount);
  }

  index = index + 3;
  sheetB.cell(index, 2).value('Financial Records');
  for (let record of financialInfo.recordsInfo || []) {
    ++index;
    sheetB.cell(index, 2).value(record.date);
    sheetB.cell(index, 3).value(record.file && record.file.url ? 'yes' : 'no');
  }

  index = index + 3;
  sheetB.cell(index, 2).value('Up to date with Social Security Payments');
  sheetB.cell(index, 4).value(financialInfo.isUpToDateSSP ? 'yes' : 'no');

  index = index + 3;
  sheetB.cell(index, 2).value('Up to date with Corporation Tax Payments');
  sheetB.cell(index, 4).value(financialInfo.isUpToDateCTP ? 'yes' : 'no');

  // Business info (PQQ-Business Integrity, HR)
  index = 1;
  sheetC.cell(index, 2).value('Human Resource Management');

  index += 2;
  sheetC.cell(index, 2).value('Meets minimum standards of fair employment practice');
  sheetC
    .cell(index, 3)
    .value((businessInfo.organizationChartFile && businessInfo.organizationChartFile.url) || '');
  sheetC
    .cell(index, 4)
    .value(
      businessInfo.doesMeetMinimumStandartsFile && businessInfo.doesMeetMinimumStandartsFile
        ? businessInfo.doesMeetMinimumStandartsFile.url
        : '',
    );

  index += 2;
  sheetC.cell(index, 2).value('Has a job description procedure in place');
  sheetC
    .cell(index, 3)
    .value((businessInfo.organizationChartFile && businessInfo.organizationChartFile.url) || '');
  sheetC
    .cell(index, 4)
    .value(
      businessInfo.doesHaveJobDescriptionFile && businessInfo.doesHaveJobDescriptionFile
        ? businessInfo.doesHaveJobDescriptionFile.url
        : '',
    );

  index += 2;
  sheetC.cell(index, 2).value('Conclude valid contracts with all employees');
  sheetC.cell(index, 3).value(businessInfo.doesConcludeValidContracts ? 'yes' : 'no');

  index += 2;
  sheetC.cell(index, 2).value('Turnover rate within company in the last 12 months');
  sheetC.cell(index, 3).value(businessInfo.employeeTurnoverRate || 0);

  index += 2;
  sheetC.cell(index, 2).value('Has liability insurance');
  sheetC.cell(index, 3).value(businessInfo.doesHaveLiabilityInsurance ? 'yes' : 'no');
  sheetC
    .cell(index, 4)
    .value(
      businessInfo.doesHaveLiabilityInsuranceFile && businessInfo.doesHaveLiabilityInsuranceFile
        ? businessInfo.doesHaveLiabilityInsuranceFile.url
        : '',
    );

  index += 3;
  sheetC.cell(index, 2).value('Corporate Business Integrity');

  index++;
  sheetC.cell(index, 2).value('Does have code ethics');
  sheetC.cell(index, 3).value(businessInfo.doesHaveCodeEthics ? 'yes' : 'no');
  sheetC
    .cell(index, 4)
    .value(
      businessInfo.doesHaveCodeEthicsFile && businessInfo.doesHaveCodeEthicsFile
        ? businessInfo.doesHaveCodeEthicsFile.url
        : '',
    );

  index += 3;
  sheetC
    .cell(index, 2)
    .value(
      'Meets minimum standards of fair employment practice required by Mongolian labor laws and regulations',
    );
  sheetC.cell(index, 3).value(businessInfo.doesHaveResponsiblityPolicy ? 'yes' : 'no');
  sheetC
    .cell(index, 4)
    .value(
      businessInfo.doesHaveResponsiblityPolicyFile && businessInfo.doesHaveResponsiblityPolicyFile
        ? businessInfo.doesHaveResponsiblityPolicyFile.url
        : '',
    );

  index += 3;
  sheetC.cell(index, 2).value('Has convicted labour laws');
  sheetC.cell(index, 3).value(businessInfo.hasConvictedLabourLaws ? 'yes' : 'no');

  index += 3;
  sheetC.cell(index, 2).value('Has convicted for human rights');
  sheetC.cell(index, 3).value(businessInfo.hasConvictedForHumanRights ? 'yes' : 'no');

  index += 3;
  sheetC.cell(index, 2).value('Was convicted for business integrity');
  sheetC.cell(index, 3).value(businessInfo.hasConvictedForBusinessIntegrity ? 'yes' : 'no');

  index += 2;
  sheetC.cell(index, 2).value('Steps taken');
  sheetC.cell(index, 3).value(businessInfo.proveHasNotConvicted);

  index += 2;
  sheetC.cell(index, 2).value('Company or any of its directors been investigated or convicted');
  sheetC.cell(index, 3).value(businessInfo.hasLeadersConvicted ? 'yes' : 'no');

  index += 3;
  sheetC
    .cell(index, 2)
    .value(
      'If the answer to the above question = YES then display the following highlit question.',
    );

  index += 2;
  sheetC.cell(index, 3).value('Investigation');
  sheetC.cell(index, 4).value('index Date');
  sheetC.cell(index, 5).value('Status');
  sheetC.cell(index, 6).value('Closure Date');

  for (let investigation of businessInfo.investigations || []) {
    ++index;
    sheetC.cell(index, 3).value(investigation.name);
    sheetC.cell(index, 4).value(investigation.date);
    sheetC.cell(index, 5).value(investigation.status);
    sheetC.cell(index, 6).value(investigation.statusDate);
  }

  index += 3;
  sheetC.cell(index, 2).value('Employ any politically exposed person');
  sheetC.cell(index, 3).value(businessInfo.doesEmployeePoliticallyExposed ? 'yes' : 'no');

  index += 2;
  sheetC.cell(index, 2).value('Pep name');
  sheetC.cell(index, 3).value(businessInfo.dpepName || '');

  // PQQ-Environment
  index = 1;
  sheetD.cell(index, 2).value('Environmental Management');

  index += 3;
  sheetD.cell(index, 2).value('Has plan');
  sheetD.cell(index, 3).value(environmentalInfo.doesHavePlan ? 'yes' : 'no');
  sheetD
    .cell(index, 4)
    .value(
      environmentalInfo.doesHavePlanFile && environmentalInfo.doesHavePlanFile
        ? environmentalInfo.doesHavePlanFile.url
        : '',
    );

  index += 3;
  sheetD.cell(index, 2).value('Has environmental regulator investigated');
  sheetD
    .cell(index, 3)
    .value(environmentalInfo.hasEnvironmentalRegulatorInvestigated ? 'yes' : 'no');

  index += 3;
  sheetD.cell(index, 2).value('Date of investigation');
  sheetD.cell(index, 3).value(environmentalInfo.dateOfInvestigation ? 'yes' : 'no');

  index += 3;
  sheetD.cell(index, 2).value('Reason for investigation');
  sheetD.cell(index, 3).value(environmentalInfo.reasonForInvestigation);

  index += 3;
  sheetD.cell(index, 2).value('Action status');
  sheetD.cell(index, 3).value(environmentalInfo.actionStatus);

  index += 3;
  sheetD.cell(index, 2).value('Investigation Documentation');
  sheetD.cell(index, 3).value(environmentalInfo.investigationDocumentation);

  index += 3;
  sheetD.cell(index, 2).value('Was convicted for environmental laws');
  sheetD.cell(index, 3).value(environmentalInfo.hasConvictedForEnvironmentalLaws ? 'yes' : 'no');

  index += 3;
  sheetD.cell(index, 2).value('Steps taken');
  sheetD.cell(index, 3).value(environmentalInfo.proveHasNotConvicted || '');

  // PQQ-HSE
  index = 1;
  sheetE.cell(index, 2).value('Health & Safety Management System');

  index += 3;
  sheetE.cell(index, 2).value('Has health safety');
  sheetE.cell(index, 3).value(healthInfo.doesHaveHealthSafety ? 'yes' : 'no');
  sheetE
    .cell(index, 4)
    .value(
      healthInfo.doesHaveHealthSafetyFile && healthInfo.doesHaveHealthSafetyFile
        ? healthInfo.doesHaveHealthSafetyFile.url
        : '',
    );

  index += 3;
  sheetE.cell(index, 2).value('HSE resources clearly identified');
  sheetE.cell(index, 3).value(healthInfo.areHSEResourcesClearlyIdentified ? 'yes' : 'no');

  index += 3;
  sheetE.cell(index, 2).value('Documented process for health and safety training and induction');
  sheetE.cell(index, 3).value(healthInfo.doesHaveDocumentedProcessToEnsure ? 'yes' : 'no');
  sheetE
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentedProcessToEnsureFile &&
      healthInfo.doesHaveDocumentedProcessToEnsureFile
        ? healthInfo.doesHaveDocumentedProcessToEnsureFile.url
        : '',
    );

  index += 3;
  sheetE
    .cell(index, 2)
    .value('Utilise appropriate Personal Protective Equipment (PPE) at all times');
  sheetE.cell(index, 3).value(healthInfo.areEmployeesUnderYourControl ? 'yes' : 'no');

  index += 3;
  sheetE.cell(index, 2).value('Has document for risk assessment');
  sheetE.cell(index, 3).value(healthInfo.doesHaveDocumentForRiskAssesment ? 'yes' : 'no');
  sheetE
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentForRiskAssesmentFile &&
      healthInfo.doesHaveDocumentForRiskAssesmentFile
        ? healthInfo.doesHaveDocumentForRiskAssesmentFile.url
        : '',
    );

  index += 3;
  sheetE.cell(index, 2).value('Has document for incident investigation');
  sheetE.cell(index, 3).value(healthInfo.doesHaveDocumentForIncidentInvestigation ? 'yes' : 'no');
  sheetE
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentForIncidentInvestigationFile &&
      healthInfo.doesHaveDocumentForIncidentInvestigationFile
        ? healthInfo.doesHaveDocumentForIncidentInvestigationFile.url
        : '',
    );

  index += 3;
  sheetE.cell(index, 2).value('Has documented Fitness for Work (FFW) policy');
  sheetE.cell(index, 3).value(healthInfo.doesHaveDocumentedFitness ? 'yes' : 'no');
  sheetE
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentedFitnessFile && healthInfo.doesHaveDocumentedFitnessFile
        ? healthInfo.doesHaveDocumentedFitnessFile.url
        : '',
    );

  index += 3;
  sheetE.cell(index, 2).value('Willing to comply with Oyu Tolgoi/RT HSE management system');
  sheetE.cell(index, 3).value(healthInfo.isWillingToComply ? 'yes' : 'no');

  index += 1;
  sheetE.cell(index, 2).value('Industrial accident occurence during the last 5 years');
  sheetE.cell(index, 3).value(healthInfo.hasIndustrialAccident ? 'yes' : 'no');

  index += 3;
  sheetE
    .cell(index, 2)
    .value(
      'Total man hours accrued for the previous five calendar years for all onsite personnel on Contractor managed projects',
    );
  sheetE.cell(index, 3).value(healthInfo.tmha || '');

  index += 3;
  sheetE
    .cell(index, 2)
    .value(
      'Lost Time Injury Frequency Rate (LTIFR) as defined for the previous five calendar years',
    );
  sheetE.cell(index, 3).value(healthInfo.ltifr || '');

  index += 3;
  sheetE
    .cell(index, 2)
    .value('Explanation of the fatality or injury event(s) that contributed to the above');
  sheetE.cell(index, 3).value(healthInfo.injuryExplanation || '');

  index += 3;
  sheetE
    .cell(index, 2)
    .value(
      'Details of how senior management demonstrates its commitment to the Oyu Tolgoi HSE policy and management system',
    );
  sheetE.cell(index, 3).value(healthInfo.seniorManagement || '');

  index += 3;
  sheetE
    .cell(index, 2)
    .value(
      'Willing to commit itself, its employees and all Sub-contractors, to implementing and being held to KPIs relating to critical risk management',
    );
  sheetE.cell(index, 3).value(healthInfo.isWillingToCommit ? 'yes' : 'no');

  index += 3;
  sheetE
    .cell(index, 2)
    .value(
      'Prepared to compile weekly and monthly safety statistics for the work performed on Site',
    );
  sheetE.cell(index, 3).value(healthInfo.isPerparedToCompile ? 'yes' : 'no');

  index += 3;
  sheetE
    .cell(index, 2)
    .value('Previously worked on World Bank or International Finance Corporation projects');
  sheetE.cell(index, 3).value(healthInfo.hasWorkedOnWorldBank ? 'yes' : 'no');
  sheetE.cell(index, 4).value(healthInfo.hasWorkedOnWorldBankDescription || '');

  index += 3;
  sheetE.cell(index, 2).value('Previously worked on large scale mining construction projects');
  sheetE.cell(index, 3).value(healthInfo.hasWorkedOnLargeProjects ? 'yes' : 'no');
  sheetE.cell(index, 4).value(healthInfo.hasWorkedOnLargeProjectsDescription || '');

  index += 3;
  sheetE
    .cell(index, 2)
    .value(
      'have valid industry certifications and/or licenses if required by the type of services provided',
    );
  sheetE.cell(index, 3).value(healthInfo.doesHaveLicense ? 'yes' : 'no');
  sheetE.cell(index, 4).value(healthInfo.doesHaveLicenseDescription || '');

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

  let rowIndex = 1;

  /*
   * Check per sections' all values are true
   */
  const isSectionPassed = sectionSchema => {
    const isPassed = Qualifications.isSectionPassed(sectionSchema);

    return isPassed ? 'Passed' : 'Failed';
  };

  for (let company of companies) {
    const qualification = await Qualifications.findOne({ supplierId: company._id });

    rowIndex++;

    const basicInfo = company.basicInfo || {};

    const fill = ({ businessInfo, healthInfo, environmentalInfo, financialInfo }) => {
      sheet.cell(rowIndex, 1).value(basicInfo.enName);
      sheet.cell(rowIndex, 2).value(businessInfo);
      sheet.cell(rowIndex, 3).value(healthInfo);
      sheet.cell(rowIndex, 4).value(environmentalInfo);
      sheet.cell(rowIndex, 5).value(financialInfo);
    };

    if (qualification) {
      fill({
        businessInfo: isSectionPassed(qualification.businessInfo),
        healthInfo: isSectionPassed(qualification.healthInfo),
        environmentalInfo: isSectionPassed(qualification.environmentalInfo),
        financialInfo: isSectionPassed(qualification.financialInfo),
      });

      continue;
    }

    fill({
      businessInfo: 'Outstanding',
      healthInfo: 'Outstanding',
      environmentalInfo: 'Outstanding',
      financialInfo: 'Outstanding',
    });
  }

  // Write to file.
  return generateXlsx(workbook, 'suppliers_prequalification');
};
