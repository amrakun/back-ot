/* eslint-disable max-len */

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

  sheetA.cell(index, 2).value('Section 1. Company Information');
  index += 2;
  sheetA.cell(index, 2).value('Company name (English)');
  sheetA.cell(index, 3).value(basicInfo.enName);

  index += 1;
  sheetA.cell(index, 2).value('Company name (Mongolian)');
  sheetA.cell(index, 3).value(basicInfo.mnName);

  index += 2;
  sheetA.cell(index, 2).value('Address');

  index += 2;
  sheetA.cell(index, 2).value('Address Line 1');
  sheetA.cell(index, 3).value(basicInfo.address || '');

  index += 1;
  sheetA.cell(index, 2).value('Address Line 2');
  sheetA.cell(index, 3).value(basicInfo.address2 || '');

  index += 1;
  sheetA.cell(index, 2).value('Address Line 3');
  sheetA.cell(index, 3).value(basicInfo.address3 || '');

  index += 2;
  sheetA.cell(index, 2).value('Town or city');
  sheetA.cell(index, 3).value(basicInfo.townOrCity || '');

  index += 2;
  sheetA.cell(index, 2).value('Province');
  sheetA.cell(index, 3).value(basicInfo.province || '');

  index += 2;
  sheetA.cell(index, 2).value('Zip code');
  sheetA.cell(index, 3).value(basicInfo.zipCode || '');

  index += 2;
  sheetA.cell(index, 2).value('Country');
  sheetA.cell(index, 3).value(basicInfo.country || '');

  index += 3;
  sheetA.cell(index, 2).value('Registered in country');
  sheetA.cell(index, 3).value(basicInfo.registeredInCountry || '');

  index += 2;
  sheetA.cell(index, 2).value('Registered in aimag');
  sheetA.cell(index, 3).value(basicInfo.registeredInAimag);

  index += 2;
  sheetA.cell(index, 2).value('Registered in sum');
  sheetA.cell(index, 3).value(basicInfo.registeredInSum || '');

  index += 3;
  sheetA.cell(index, 2).value('Is Chinese state owned entity');
  sheetA.cell(index, 3).value(basicInfo.isChinese ? 'yes' : 'no');

  index += 3;
  sheetA.cell(index, 2).value('Is registered sub-contractor');
  sheetA.cell(index, 3).value(basicInfo.isSubcontractor ? 'yes' : 'no');

  index += 3;
  sheetA.cell(index, 2).value('Closest matching corporate structure');
  sheetA.cell(index, 3).value(basicInfo.corporateStructure);

  index += 3;
  sheetA.cell(index, 2).value('Company Registration Number');
  sheetA.cell(index, 3).value(basicInfo.registrationNumber);

  index += 3;
  sheetA.cell(index, 2).value('Certificate of Registration');
  sheetA
    .cell(index, 3)
    .value(basicInfo.certificateOfRegistration ? basicInfo.certificateOfRegistration.url : '');

  index += 3;
  sheetA.cell(index, 2).value('Company web site');
  sheetA.cell(index, 3).value(basicInfo.website || '');

  index += 3;
  sheetA.cell(index, 2).value('Company email address');
  sheetA.cell(index, 3).value(basicInfo.email || '');

  index += 3;
  sheetA.cell(index, 2).value('Foreign ownership percentage');
  sheetA.cell(index, 3).value(basicInfo.foreignOwnershipPercentage || '');

  index += 3;
  sheetA.cell(index, 2).value('Total number of employees');
  sheetA.cell(index, 3).value(basicInfo.totalNumberOfEmployees || '');

  index += 3;
  sheetA.cell(index, 2).value('Total number of mongolian employees');
  sheetA.cell(index, 3).value(basicInfo.totalNumberOfMongolianEmployees || '');

  index += 3;
  sheetA.cell(index, 2).value('Total number of Umnugovi employees');
  sheetA.cell(index, 3).value(basicInfo.totalNumberOfUmnugoviEmployees || '');

  index += 3;
  sheetA.cell(index, 2).value('Section 2. Contact Details');

  index += 2;
  sheetA.cell(index, 2).value('Name');
  sheetA.cell(index, 3).value(contactInfo.name || '');

  index += 2;
  sheetA.cell(index, 2).value('Job title');
  sheetA.cell(index, 3).value(contactInfo.jobTitle || '');

  index += 2;
  sheetA.cell(index, 2).value('Address');
  sheetA.cell(index, 3).value(contactInfo.address || '');

  index++;
  sheetA.cell(index, 2).value('Address 2');
  sheetA.cell(index, 3).value(contactInfo.address2 || '');

  index++;
  sheetA.cell(index, 2).value('Address 3');
  sheetA.cell(index, 3).value(contactInfo.address3 || '');

  index += 2;
  sheetA.cell(index, 2).value('Phone');
  sheetA.cell(index, 3).value(contactInfo.phone || '');

  index += 2;
  sheetA.cell(index, 2).value('Phone 2');
  sheetA.cell(index, 3).value(contactInfo.phone2 || '');

  index += 2;
  sheetA.cell(index, 2).value('Email address');
  sheetA.cell(index, 3).value(contactInfo.email || '');

  const { managingDirector = {} } = managementTeamInfo;

  index += 3;
  sheetA.cell(index, 2).value('Section 3. Management Team');

  index += 2;
  sheetA.cell(index, 2).value('Managing Director');

  index += 2;
  sheetA.cell(index, 2).value('Name');
  sheetA.cell(index++, 3).value(managingDirector.name || '');

  sheetA.cell(index, 2).value('Job title');
  sheetA.cell(index++, 3).value(managingDirector.jobTitle || '');

  sheetA.cell(index, 2).value('Phone');
  sheetA.cell(index++, 3).value(managingDirector.phone || '');

  sheetA.cell(index, 2).value('Email');
  sheetA.cell(index++, 3).value(managingDirector.email || '');

  const { executiveOfficer = {} } = managementTeamInfo;

  index += 2;
  sheetA.cell(index, 2).value('Executive Officer');
  index += 2;

  sheetA.cell(index, 2).value('Name');
  sheetA.cell(index++, 3).value(executiveOfficer.name || '');

  sheetA.cell(index, 2).value('Job title');
  sheetA.cell(index++, 3).value(executiveOfficer.jobTitle || '');

  sheetA.cell(index, 2).value('Phone');
  sheetA.cell(index++, 3).value(executiveOfficer.phone || '');

  sheetA.cell(index, 2).value('Email');
  sheetA.cell(index++, 3).value(executiveOfficer.email || '');

  const { salesDirector = {} } = managementTeamInfo;

  index += 2;
  sheetA.cell(index, 2).value('Sales Director');
  index += 2;

  sheetA.cell(index, 2).value('Name');
  sheetA.cell(index++, 3).value(salesDirector.name || '');

  sheetA.cell(index, 2).value('Job title');
  sheetA.cell(index++, 3).value(salesDirector.jobTitle || '');

  sheetA.cell(index, 2).value('Phone');
  sheetA.cell(index++, 3).value(salesDirector.phone || '');

  sheetA.cell(index, 2).value('Email');
  sheetA.cell(index++, 3).value(salesDirector.email || '');

  const { financialDirector = {} } = managementTeamInfo;

  index += 2;
  sheetA.cell(index, 2).value('Financial Director');
  index += 2;

  sheetA.cell(index, 2).value('Name');
  sheetA.cell(index++, 3).value(financialDirector.name || '');

  sheetA.cell(index, 2).value('Job title');
  sheetA.cell(index++, 3).value(financialDirector.jobTitle || '');

  sheetA.cell(index, 2).value('Phone');
  sheetA.cell(index++, 3).value(financialDirector.phone || '');

  sheetA.cell(index, 2).value('Email');
  sheetA.cell(index++, 3).value(financialDirector.email || '');

  const otherMember1 = managementTeamInfo.otherMember1 || null;

  if (otherMember1) {
    index += 2;
    sheetA.cell(index, 2).value('Other member 1');
    index += 2;

    sheetA.cell(index, 2).value('Name');
    sheetA.cell(index++, 3).value(otherMember1.name || '');

    sheetA.cell(index, 2).value('Job title');
    sheetA.cell(index++, 3).value(otherMember1.jobTitle || '');

    sheetA.cell(index, 2).value('Phone');
    sheetA.cell(index++, 3).value(otherMember1.phone || '');

    sheetA.cell(index, 2).value('Email');
    sheetA.cell(index++, 3).value(otherMember1.email || '');
  }

  const otherMember2 = managementTeamInfo.otherMember2 || null;

  if (otherMember2) {
    index += 2;
    sheetA.cell(index, 2).value('Other member 2');
    index += 2;

    sheetA.cell(index, 2).value('Name');
    sheetA.cell(index++, 3).value(otherMember2.name || '');

    sheetA.cell(index, 2).value('Job title');
    sheetA.cell(index++, 3).value(otherMember2.jobTitle || '');

    sheetA.cell(index, 2).value('Phone');
    sheetA.cell(index++, 3).value(otherMember2.phone || '');

    sheetA.cell(index, 2).value('Email');
    sheetA.cell(index++, 3).value(otherMember2.email || '');
  }

  const { otherMember3 = {} } = managementTeamInfo;

  if (otherMember3) {
    index += 2;
    sheetA.cell(index, 2).value('Other member 3');
    index += 2;

    sheetA.cell(index, 2).value('Name');
    sheetA.cell(index++, 3).value(otherMember3.name || '');

    sheetA.cell(index, 2).value('Job title');
    sheetA.cell(index++, 3).value(otherMember3.jobTitle || '');

    sheetA.cell(index, 2).value('Phone');
    sheetA.cell(index++, 3).value(otherMember3.phone || '');

    sheetA.cell(index, 2).value('Email');
    sheetA.cell(index++, 3).value(otherMember3.email || '');
  }

  // company shareholders
  let shareholders =
    shareholderInfo.shareholders && shareholderInfo.shareholders.length > 0
      ? shareholderInfo.shareholders
      : [];

  index += 3;
  sheetA.cell(index, 2).value('Section 4. Company Shareholder Information');
  index += 2;

  for (let shareholder of shareholders) {
    sheetA.cell(index, 2).value('Name');
    sheetA.cell(index++, 3).value(shareholder.name || '');

    sheetA.cell(index, 2).value('Job title');
    sheetA.cell(index++, 3).value(shareholder.jobTitle || '');

    sheetA.cell(index, 2).value('Share percentage');
    sheetA.cell(index++, 3).value(shareholder.percentage || 0);
    index++;
  }

  // groupInfo
  index += 3;
  sheetA.cell(index, 2).value('Section 5. Group Information');

  index += 2;
  sheetA.cell(index, 2).value('Has a parent company');
  sheetA.cell(index, 3).value(groupInfo.hasParent ? 'yes' : 'no');

  index += 2;
  sheetA.cell(index, 2).value('Parent company is existing supplier?');
  sheetA.cell(index, 3).value(groupInfo.isParentExistingSup ? 'yes' : 'no');

  index += 2;
  sheetA.cell(index, 2).value('Parent company name');
  sheetA.cell(index, 3).value(groupInfo.parentName || '');

  index += 2;
  sheetA.cell(index, 2).value('Parent company address');
  sheetA.cell(index, 3).value(groupInfo.parentAddress || '');

  index += 2;
  sheetA.cell(index, 2).value('Registration number of parent company');
  sheetA.cell(index, 3).value(groupInfo.parentRegistrationNumber || '');

  index += 2;
  sheetA.cell(index, 2).value('Company role');
  sheetA.cell(index, 3).value(groupInfo.role || '');

  if (groupInfo.role == 'EOM') {
    index += 2;
    sheetA.cell(index, 2).value('Factory name');
    sheetA.cell(index, 3).value('Town or City');
    sheetA.cell(index, 4).value('Country');
    sheetA.cell(index, 5).value('Associated Product');

    for (let factory of groupInfo.factories || []) {
      ++index;
      sheetA.cell(index, 2).value(factory.name || '');
      sheetA.cell(index, 3).value(factory.townOrCity || '');
      sheetA.cell(index, 4).value(factory.country || '');
      sheetA.cell(index, 5).value(factory.productCodes || '');
    }
  }

  index += 3;
  sheetA.cell(index, 2).value('Is exclusive distributor?');
  sheetA.cell(index, 3).value(groupInfo.isExclusiveDistributor ? 'yes' : 'no');

  index += 2;
  sheetA.cell(index, 2).value('Primary manufacturer name');
  sheetA.cell(index, 3).value(groupInfo.primaryManufacturerName || '');

  index += 2;
  sheetA.cell(index, 2).value('Country of primary manufacture');
  sheetA.cell(index, 3).value(groupInfo.countryOfPrimaryManufacturer || '');

  // Product and Services
  index += 3;
  sheetA.cell(index, 2).value('Section 6. Product and Services');

  index += 2;
  sheetA.cell(index, 2).value('Product/Service code');
  sheetA.cell(index, 3).value((groupInfo.productsInfo || []).join());

  // Capacity building certificate
  index += 3;
  sheetA.cell(index, 2).value('Capacity building certificate');

  index += 2;
  sheetA.cell(index, 2).value('Company received capacity building certificate');
  sheetA.cell(index, 3).value(certificateInfo.isReceived ? 'yes' : 'no');

  index += 2;
  sheetA.cell(index, 2).value('Certificate url');
  sheetA
    .cell(index, 3)
    .value((certificateInfo && certificateInfo.file && certificateInfo.file.url) || '');

  // Financial Information
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

    sheet.cell(rowIndex, 1).value(basicInfo.enName);
    sheet.cell(rowIndex, 2).value(basicInfo.sapNumber);
    sheet.cell(rowIndex, 3).value(company.tierType);
    sheet.cell(rowIndex, 4).value(company.isProductsInfoValidated);
    sheet.cell(rowIndex, 5).value(`Total: ${total} | Validated: ${validated}`);
    sheet.cell(rowIndex, 6).value(company.productsInfoLastValidatedDate.toLocaleDateString());
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
      return fill({
        businessInfo: isSectionPassed(qualification.businessInfo),
        healthInfo: isSectionPassed(qualification.healthInfo),
        environmentalInfo: isSectionPassed(qualification.environmentalInfo),
        financialInfo: isSectionPassed(qualification.financialInfo),
      });
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
