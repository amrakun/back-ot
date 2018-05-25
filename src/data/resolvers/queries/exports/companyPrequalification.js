/* eslint-disable max-len */

import { readTemplate, generateXlsx } from '../../utils';

export const companyDetailExport = async supplier => {
  const { workbook } = await readTemplate('company_prequalification');

  const sheet = workbook.sheet(1);

  const basicInfo = supplier.basicInfo || {};
  const financialInfo = supplier.financialInfo || {};
  const businessInfo = supplier.businessInfo || {};
  const environmentalInfo = supplier.environmentalInfo || {};
  const healthInfo = supplier.healthInfo || {};

  const fillValue = (v1, v2, v3, fill) => {
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
      .value(v1);

    sheet
      .cell(index, 3)
      .style(style)
      .value(v2);

    sheet
      .cell(index, 4)
      .style(style)
      .value(v3);

    index++;
  };

  const fillSection = (title, supplierResponse, preQualified) => {
    const style = {
      horizontalAlignment: 'center',
      fill: 'f47721',
      fontColor: 'ffffff',
      bold: true,
    };

    sheet
      .cell(index, 2)
      .style(style)
      .value(title);

    sheet
      .cell(index, 3)
      .style(style)
      .value(supplierResponse);

    sheet
      .cell(index, 4)
      .style(style)
      .value(preQualified);

    index++;
  };

  let index = 1;

  fillValue('Company name (English)', basicInfo.enName, '2496a9');
  fillValue('Vendor number', basicInfo.sapNumber, '2496a9');
  fillValue('Tier type', supplier.tierType, '2496a9');

  fillSection('Financial Information');

  index = index + 2;
  sheet.cell(index, 2).value('Accounts for last 3 years');
  sheet.cell(index, 4).value(financialInfo.canProvideAccountsInfo ? 'yes' : 'no');

  index = index + 2;
  sheet.cell(index, 2).value('Reasons');
  sheet.cell(index, 4).value(financialInfo.reasonToCannotNotProvide || '');

  index = index + 2;
  sheet.cell(index, 2).value('Currency');
  sheet.cell(index, 4).value(financialInfo.currency || '');

  index = index + 3;
  sheet.cell(index, 2).value('Annual Turnover');
  for (let annualTurnover of financialInfo.annualTurnover || []) {
    ++index;
    sheet.cell(index, 2).value(annualTurnover.year);
    sheet.cell(index, 3).value(annualTurnover.amount);
  }

  index = index + 3;
  sheet.cell(index, 2).value('Annual Turnover');
  for (let preTaxProfit of financialInfo.preTaxProfit || []) {
    ++index;
    sheet.cell(index, 2).value(preTaxProfit.year);
    sheet.cell(index, 3).value(preTaxProfit.amount);
  }

  index = index + 3;
  sheet.cell(index, 2).value('Total Assets');
  for (let totalAssets of financialInfo.totalAssets || []) {
    ++index;
    sheet.cell(index, 2).value(totalAssets.year);
    sheet.cell(index, 3).value(totalAssets.amount);
  }

  index = index + 3;
  sheet.cell(index, 2).value('Total Current Assets');
  for (let totalCurrentAssets of financialInfo.totalCurrentAssets || []) {
    ++index;
    sheet.cell(index, 2).value(totalCurrentAssets.year);
    sheet.cell(index, 3).value(totalCurrentAssets.amount);
  }

  index = index + 3;
  sheet.cell(index, 2).value('Total Short Term Liabilities');

  index = index + 3;
  sheet.cell(index, 2).value("Total Shareholder's Equity");
  for (let totalShareholderEquity of financialInfo.totalShareholderEquity || []) {
    ++index;
    sheet.cell(index, 2).value(totalShareholderEquity.year);
    sheet.cell(index, 3).value(totalShareholderEquity.amount);
  }

  index = index + 3;
  sheet.cell(index, 2).value('Financial Records');
  for (let record of financialInfo.recordsInfo || []) {
    ++index;
    sheet.cell(index, 2).value(record.date);
    sheet.cell(index, 3).value(record.file && record.file.url ? 'yes' : 'no');
  }

  index = index + 3;
  sheet.cell(index, 2).value('Up to date with Social Security Payments');
  sheet.cell(index, 4).value(financialInfo.isUpToDateSSP ? 'yes' : 'no');

  index = index + 3;
  sheet.cell(index, 2).value('Up to date with Corporation Tax Payments');
  sheet.cell(index, 4).value(financialInfo.isUpToDateCTP ? 'yes' : 'no');

  // Business info (PQQ-Business Integrity, HR)
  index = 1;
  sheet.cell(index, 2).value('Human Resource Management');

  index += 2;
  sheet.cell(index, 2).value('Meets minimum standards of fair employment practice');
  sheet
    .cell(index, 3)
    .value((businessInfo.organizationChartFile && businessInfo.organizationChartFile.url) || '');
  sheet
    .cell(index, 4)
    .value(
      businessInfo.doesMeetMinimumStandartsFile && businessInfo.doesMeetMinimumStandartsFile
        ? businessInfo.doesMeetMinimumStandartsFile.url
        : '',
    );

  index += 2;
  sheet.cell(index, 2).value('Has a job description procedure in place');
  sheet
    .cell(index, 3)
    .value((businessInfo.organizationChartFile && businessInfo.organizationChartFile.url) || '');
  sheet
    .cell(index, 4)
    .value(
      businessInfo.doesHaveJobDescriptionFile && businessInfo.doesHaveJobDescriptionFile
        ? businessInfo.doesHaveJobDescriptionFile.url
        : '',
    );

  index += 2;
  sheet.cell(index, 2).value('Conclude valid contracts with all employees');
  sheet.cell(index, 3).value(businessInfo.doesConcludeValidContracts ? 'yes' : 'no');

  index += 2;
  sheet.cell(index, 2).value('Turnover rate within company in the last 12 months');
  sheet.cell(index, 3).value(businessInfo.employeeTurnoverRate || 0);

  index += 2;
  sheet.cell(index, 2).value('Has liability insurance');
  sheet.cell(index, 3).value(businessInfo.doesHaveLiabilityInsurance ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      businessInfo.doesHaveLiabilityInsuranceFile && businessInfo.doesHaveLiabilityInsuranceFile
        ? businessInfo.doesHaveLiabilityInsuranceFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('Corporate Business Integrity');

  index++;
  sheet.cell(index, 2).value('Does have code ethics');
  sheet.cell(index, 3).value(businessInfo.doesHaveCodeEthics ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      businessInfo.doesHaveCodeEthicsFile && businessInfo.doesHaveCodeEthicsFile
        ? businessInfo.doesHaveCodeEthicsFile.url
        : '',
    );

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'Meets minimum standards of fair employment practice required by Mongolian labor laws and regulations',
    );
  sheet.cell(index, 3).value(businessInfo.doesHaveResponsiblityPolicy ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      businessInfo.doesHaveResponsiblityPolicyFile && businessInfo.doesHaveResponsiblityPolicyFile
        ? businessInfo.doesHaveResponsiblityPolicyFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('Has convicted labour laws');
  sheet.cell(index, 3).value(businessInfo.hasConvictedLabourLaws ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Has convicted for human rights');
  sheet.cell(index, 3).value(businessInfo.hasConvictedForHumanRights ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Was convicted for business integrity');
  sheet.cell(index, 3).value(businessInfo.hasConvictedForBusinessIntegrity ? 'yes' : 'no');

  index += 2;
  sheet.cell(index, 2).value('Steps taken');
  sheet.cell(index, 3).value(businessInfo.proveHasNotConvicted);

  index += 2;
  sheet.cell(index, 2).value('Company or any of its directors been investigated or convicted');
  sheet.cell(index, 3).value(businessInfo.hasLeadersConvicted ? 'yes' : 'no');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'If the answer to the above question = YES then display the following highlit question.',
    );

  index += 2;
  sheet.cell(index, 3).value('Investigation');
  sheet.cell(index, 4).value('index Date');
  sheet.cell(index, 5).value('Status');
  sheet.cell(index, 6).value('Closure Date');

  for (let investigation of businessInfo.investigations || []) {
    ++index;
    sheet.cell(index, 3).value(investigation.name);
    sheet.cell(index, 4).value(investigation.date);
    sheet.cell(index, 5).value(investigation.status);
    sheet.cell(index, 6).value(investigation.statusDate);
  }

  index += 3;
  sheet.cell(index, 2).value('Employ any politically exposed person');
  sheet.cell(index, 3).value(businessInfo.doesEmployeePoliticallyExposed ? 'yes' : 'no');

  index += 2;
  sheet.cell(index, 2).value('Pep name');
  sheet.cell(index, 3).value(businessInfo.dpepName || '');

  // PQQ-Environment
  index = 1;
  sheet.cell(index, 2).value('Environmental Management');

  index += 3;
  sheet.cell(index, 2).value('Has plan');
  sheet.cell(index, 3).value(environmentalInfo.doesHavePlan ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      environmentalInfo.doesHavePlanFile && environmentalInfo.doesHavePlanFile
        ? environmentalInfo.doesHavePlanFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('Has environmental regulator investigated');
  sheet
    .cell(index, 3)
    .value(environmentalInfo.hasEnvironmentalRegulatorInvestigated ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Date of investigation');
  sheet.cell(index, 3).value(environmentalInfo.dateOfInvestigation ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Reason for investigation');
  sheet.cell(index, 3).value(environmentalInfo.reasonForInvestigation);

  index += 3;
  sheet.cell(index, 2).value('Action status');
  sheet.cell(index, 3).value(environmentalInfo.actionStatus);

  index += 3;
  sheet.cell(index, 2).value('Investigation Documentation');
  sheet.cell(index, 3).value(environmentalInfo.investigationDocumentation);

  index += 3;
  sheet.cell(index, 2).value('Was convicted for environmental laws');
  sheet.cell(index, 3).value(environmentalInfo.hasConvictedForEnvironmentalLaws ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Steps taken');
  sheet.cell(index, 3).value(environmentalInfo.proveHasNotConvicted || '');

  // PQQ-HSE
  index = 1;
  sheet.cell(index, 2).value('Health & Safety Management System');

  index += 3;
  sheet.cell(index, 2).value('Has health safety');
  sheet.cell(index, 3).value(healthInfo.doesHaveHealthSafety ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      healthInfo.doesHaveHealthSafetyFile && healthInfo.doesHaveHealthSafetyFile
        ? healthInfo.doesHaveHealthSafetyFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('HSE resources clearly identified');
  sheet.cell(index, 3).value(healthInfo.areHSEResourcesClearlyIdentified ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Documented process for health and safety training and induction');
  sheet.cell(index, 3).value(healthInfo.doesHaveDocumentedProcessToEnsure ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentedProcessToEnsureFile &&
      healthInfo.doesHaveDocumentedProcessToEnsureFile
        ? healthInfo.doesHaveDocumentedProcessToEnsureFile.url
        : '',
    );

  index += 3;
  sheet
    .cell(index, 2)
    .value('Utilise appropriate Personal Protective Equipment (PPE) at all times');
  sheet.cell(index, 3).value(healthInfo.areEmployeesUnderYourControl ? 'yes' : 'no');

  index += 3;
  sheet.cell(index, 2).value('Has document for risk assessment');
  sheet.cell(index, 3).value(healthInfo.doesHaveDocumentForRiskAssesment ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentForRiskAssesmentFile &&
      healthInfo.doesHaveDocumentForRiskAssesmentFile
        ? healthInfo.doesHaveDocumentForRiskAssesmentFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('Has document for incident investigation');
  sheet.cell(index, 3).value(healthInfo.doesHaveDocumentForIncidentInvestigation ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentForIncidentInvestigationFile &&
      healthInfo.doesHaveDocumentForIncidentInvestigationFile
        ? healthInfo.doesHaveDocumentForIncidentInvestigationFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('Has documented Fitness for Work (FFW) policy');
  sheet.cell(index, 3).value(healthInfo.doesHaveDocumentedFitness ? 'yes' : 'no');
  sheet
    .cell(index, 4)
    .value(
      healthInfo.doesHaveDocumentedFitnessFile && healthInfo.doesHaveDocumentedFitnessFile
        ? healthInfo.doesHaveDocumentedFitnessFile.url
        : '',
    );

  index += 3;
  sheet.cell(index, 2).value('Willing to comply with Oyu Tolgoi/RT HSE management system');
  sheet.cell(index, 3).value(healthInfo.isWillingToComply ? 'yes' : 'no');

  index += 1;
  sheet.cell(index, 2).value('Industrial accident occurence during the last 5 years');
  sheet.cell(index, 3).value(healthInfo.hasIndustrialAccident ? 'yes' : 'no');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'Total man hours accrued for the previous five calendar years for all onsite personnel on Contractor managed projects',
    );
  sheet.cell(index, 3).value(healthInfo.tmha || '');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'Lost Time Injury Frequency Rate (LTIFR) as defined for the previous five calendar years',
    );
  sheet.cell(index, 3).value(healthInfo.ltifr || '');

  index += 3;
  sheet
    .cell(index, 2)
    .value('Explanation of the fatality or injury event(s) that contributed to the above');
  sheet.cell(index, 3).value(healthInfo.injuryExplanation || '');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'Details of how senior management demonstrates its commitment to the Oyu Tolgoi HSE policy and management system',
    );
  sheet.cell(index, 3).value(healthInfo.seniorManagement || '');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'Willing to commit itself, its employees and all Sub-contractors, to implementing and being held to KPIs relating to critical risk management',
    );
  sheet.cell(index, 3).value(healthInfo.isWillingToCommit ? 'yes' : 'no');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'Prepared to compile weekly and monthly safety statistics for the work performed on Site',
    );
  sheet.cell(index, 3).value(healthInfo.isPerparedToCompile ? 'yes' : 'no');

  index += 3;
  sheet
    .cell(index, 2)
    .value('Previously worked on World Bank or International Finance Corporation projects');
  sheet.cell(index, 3).value(healthInfo.hasWorkedOnWorldBank ? 'yes' : 'no');
  sheet.cell(index, 4).value(healthInfo.hasWorkedOnWorldBankDescription || '');

  index += 3;
  sheet.cell(index, 2).value('Previously worked on large scale mining construction projects');
  sheet.cell(index, 3).value(healthInfo.hasWorkedOnLargeProjects ? 'yes' : 'no');
  sheet.cell(index, 4).value(healthInfo.hasWorkedOnLargeProjectsDescription || '');

  index += 3;
  sheet
    .cell(index, 2)
    .value(
      'have valid industry certifications and/or licenses if required by the type of services provided',
    );
  sheet.cell(index, 3).value(healthInfo.doesHaveLicense ? 'yes' : 'no');
  sheet.cell(index, 4).value(healthInfo.doesHaveLicenseDescription || '');

  return generateXlsx(workbook, 'company_detail_export');
};
