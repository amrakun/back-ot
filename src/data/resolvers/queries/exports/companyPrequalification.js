/* eslint-disable max-len */

import cf from 'cellref';
import xlsxPopulate from 'xlsx-populate';
import { generateXlsx } from '../../../utils';
import { Qualifications } from '../../../../db/models';

const generate = async supplier => {
  const workbook = await xlsxPopulate.fromBlankAsync();

  const sheet = workbook.sheet('Sheet1');

  sheet.column('B').width(100);
  sheet.column('C').width(30);
  sheet.column('D').width(30);
  sheet.column('E').width(60);

  const qualification = await Qualifications.findOne({ supplierId: supplier._id });

  const basicInfo = supplier.basicInfo || {};
  const financialInfo = supplier.financialInfo || {};

  let index = 1;

  const fillValue = (colIndex, value, extraStyle = {}) => {
    const style = {
      horizontalAlignment: 'left',
      verticalAlignment: 'center',
      wrapText: true,
      fontSize: 16,
      ...extraStyle,
    };

    if (extraStyle.fill) {
      style.fontColor = 'ffffff';
    }

    sheet
      .cell(index, colIndex)
      .style(style)
      .value(value);
  };

  // header ===============
  const { isPrequalified, prequalifiedDate } = supplier;
  const status = isPrequalified ? 'Pre-qualified' : 'Not pre-qualified';
  const expiryDate = await Qualifications.getExpiryDate(supplier._id);

  const horizontalAlignment = 'center';

  const headerEnd = () => {
    sheet.range(`${cf(`R${index}C3`)}:${cf(`R${index}C6`)}`).merged(true);

    index++;
  };

  const fillHeader = (title, value) => {
    fillValue(2, title, { fill: '2496a9' });
    fillValue(3, value, { fill: '2496a9', horizontalAlignment });

    headerEnd();
  };

  fillHeader('Company name (English)', basicInfo.enName);

  fillValue(2, 'Pre-qualification status', { fill: '2496a9' });
  fillValue(3, status, { fill: '2496a9', fontSize: 20, horizontalAlignment, bold: true });
  headerEnd();

  fillHeader(
    'Pre-qualification start date',
    prequalifiedDate && prequalifiedDate.toLocaleDateString(),
  );

  fillHeader('Pre-qualification expiry date', expiryDate && expiryDate.toLocaleDateString());

  // start of the body ===========
  const fillSection = (number, title) => {
    fillValue(1, number);
    fillValue(2, title, { fill: 'f47721' });
    fillValue(3, 'Supplier`s response', { fill: 'f47721' });
    fillValue(5, 'Pre-qualification assessment', { fill: 'f47721' });

    sheet.range(`${cf(`R${index}C3`)}:${cf(`R${index}C4`)}`).merged(true);

    index++;
  };

  const fillSectionResult = (title, sName) => {
    const isPassed = Qualifications.isSectionPassed(qualification[sName]);
    const result = isPassed ? 'Pre-qualified' : 'Not qualified';

    fillValue(2, `${title} - Prequalification status`, { fill: '2496a9', bold: true });
    fillValue(3, result, { fill: '2496a9', horizontalAlignment: 'center', bold: true });

    sheet.range(`${cf(`R${index}C3`)}:${cf(`R${index}C5`)}`).merged(true);

    index++;
  };

  const fillSValue = (title, value) => {
    fillValue(2, title);
    fillValue(3, value || '');
    index++;
  };

  // with qualification information
  const fillQValue = (title, sName, fName, answerExtraGenerator) => {
    fillValue(2, title);

    const section = supplier[sName] || {};

    let sAnswer = section[fName];
    let sAnswerExtra = '';

    if (typeof sAnswer === 'boolean') {
      sAnswer = sAnswer ? 'Yes' : 'No';
    }

    if (section[`${fName}File`]) {
      sAnswerExtra = 'file submitted';
    }

    if (section[`${fName}Description`]) {
      sAnswerExtra = section[`${fName}Description`];
    }

    if (answerExtraGenerator) {
      sAnswerExtra = answerExtraGenerator(section);
    }

    const assessment = (qualification[sName] || {})[fName] ? 'Qualified' : 'Not qualified';

    fillValue(3, sAnswer);
    fillValue(4, sAnswerExtra);
    fillValue(5, assessment);

    index++;
  };

  // financial info =====
  fillSection(1, 'Financial information');

  fillSValue(
    'Can you provide accounts for the last 3 financial years?',
    financialInfo.canProvideAccountsInfo ? 'yes' : 'no',
  );

  if (!financialInfo.canProvideAccountsInfo) {
    fillSValue('If not, explain the reason', financialInfo.reasonToCannotNotProvide);
  }

  fillSValue('Currency', financialInfo.currency);

  // fill per financial record value
  const fillPerFRecord = (title, key, valueGenerator) => {
    const records = financialInfo[key] || [];

    for (let record of records) {
      fillValue(2, title, { italic: true, fontColor: '8a8686' });

      let v1 = record.year;
      let v2 = record.amount;

      if (valueGenerator) {
        [v1, v2] = valueGenerator(record);
      }

      fillValue(3, v1, { italic: true, fontColor: '8a8686' });
      fillValue(4, v2, { italic: true, fontColor: '8a8686' });
      index++;
    }
  };

  fillPerFRecord('Annual Turnover', 'annualTurnover');
  fillPerFRecord('Pre-Tax Profit', 'preTaxProfit');
  fillPerFRecord('Total Assets', 'totalAssets');
  fillPerFRecord('Total Current Assets', 'totalCurrentAssets');
  fillPerFRecord('Total shareholders equity', 'totalShareholderEquity');
  fillPerFRecord('Financial records', 'recordsInfo', r => [
    new Date(r.date).toLocaleDateString(),
    r.file && r.file.url,
  ]);

  fillQValue(
    'Is your company up to date with Social Security payments?',
    'financialInfo',
    'isUpToDateSSP',
  );

  fillQValue(
    'Is your company up to date with Corporation Tax payments?',
    'financialInfo',
    'isUpToDateCTP',
  );

  fillSectionResult('Financial information', 'financialInfo');

  // Business integrity & human resource =====
  fillSection(2, 'Business integrity & human resource');

  fillQValue(
    'Does your company meet minimum standards of fair employment practice required by Mongolian labor laws and regulations',
    'businessInfo',
    'doesMeetMinimumStandarts',
  );

  fillQValue(
    'Does the Company have a job description procedure in place?',
    'businessInfo',
    'doesHaveJobDescription',
  );

  fillQValue(
    'Does the company conclude valid contracts with all employees. (include skilled/unskilled, temporary and permanent, and underage workers, etc)',
    'businessInfo',
    'doesConcludeValidContracts',
  );

  fillQValue(
    'Please provide the employee turnover rate within your company in the last 12 months',
    'businessInfo',
    'employeeTurnoverRate',
  );

  fillQValue(
    'Does the organisation have Liability insurance which meets Oyu Tolgoi’s minimum requirements and valid worker compensation insurance or enrolment in an applicable occupational injury/illness insurance programme?',
    'businessInfo',
    'doesHaveLiabilityInsurance',
  );

  fillQValue(
    'Does your company have a documented code of ethics/conduct?',
    'businessInfo',
    'doesHaveCodeEthics',
  );

  fillQValue(
    'Does your company have a documented Corporate Social Responsibility policy',
    'businessInfo',
    'doesHaveResponsiblityPolicy',
  );

  fillQValue(
    'Has your company ever been convicted for a breach of any labour laws in the countries you operate within the last five years?',
    'businessInfo',
    'hasConvictedLabourLaws',
  );

  fillQValue(
    'Has your company ever been convicted for a breach of any human rights in the countries you operate within the last five years?',
    'businessInfo',
    'hasConvictedForHumanRights',
  );

  fillQValue(
    'Has your company ever been convicted for a breach of any business integrity in the countries you operate within the last five years?',
    'businessInfo',
    'hasConvictedForBusinessIntegrity',
  );

  fillQValue(
    'Has your company or any of its directors been investigated or convicted of any other legal infringement not described above within the last five years?',
    'businessInfo',
    'hasLeadersConvicted',
  );

  fillQValue(
    'Does your company employ any politically exposed person? If yes, provide list of PEP name',
    'businessInfo',
    'doesEmployeePoliticallyExposed',
    section => {
      return section.pepName;
    },
  );

  fillQValue(
    'Does your company, parent company or any sub-contractor is registered in any of the following countries to which international trade sanctions apply',
    'businessInfo',
    'isSubContractor',
  );

  fillSectionResult('Business Integrity & HR', 'businessInfo');

  // Environmental management =====
  fillSection(3, 'Environmental management');

  fillQValue(
    'Does the organisation have environmental management plans or procedures (including air quality, greenhouse gases emissions, water and contamination prevention, noise and vibration, Waste Management)?',
    'environmentalInfo',
    'doesHavePlan',
  );

  fillQValue(
    'Has any environmental regulator inspected / investigated your company within the last 5 years',
    'environmentalInfo',
    'hasEnvironmentalRegulatorInvestigated',
  );

  fillQValue(
    'Has your company ever been convicted for a breach of any Environmental laws in the countries you operate?',
    'environmentalInfo',
    'hasConvictedForEnvironmentalLaws',
  );

  fillSectionResult('Environmental Management', 'environmentalInfo');

  // Health & Safety Management System ==================
  fillSection(4, 'Health & Safety Management System');

  fillQValue(
    'Does the organisation have a Health Safety & Environment management system?',
    'healthInfo',
    'doesHaveHealthSafety',
  );

  fillQValue(
    'Are HSE resources, roles, responsibilities and authority levels clearly identified and defined within your Organisation?',
    'healthInfo',
    'areHSEResourcesClearlyIdentified',
  );

  fillQValue(
    'Does your company have a documented process to ensure all staff receive health and safety training and induction?',
    'healthInfo',
    'doesHaveDocumentedProcessToEnsure',
  );

  fillQValue(
    'Are all employees under your control required to utilise appropriate Personal Protective Equipment (PPE) at all times?',
    'healthInfo',
    'areEmployeesUnderYourControl',
  );

  fillQValue(
    'Does the company have a documented process or guidelines for risk assessment (including CRM)?',
    'healthInfo',
    'doesHaveDocumentForRiskAssesment',
  );

  fillQValue(
    'Does the company have a documented process for incident investigation',
    'healthInfo',
    'doesHaveDocumentForIncidentInvestigation',
  );

  fillQValue(
    'Does your company have a documented Fitness for Work (FFW) policy',
    'healthInfo',
    'doesHaveDocumentedFitness',
  );

  fillQValue(
    'Is your company willing to comply with Oyu Tolgoi/RT HSE management system',
    'healthInfo',
    'isWillingToComply',
  );

  const productsInfo = supplier.productsInfo || [];

  if (productsInfo.includes('a01001') || productsInfo.includes('a01002')) {
    fillQValue(
      'Has there been any industrial accident in the last 5 financial years?',
      'healthInfo',
      'hasIndustrialAccident',
    );

    fillQValue(
      'Provide total man hours accrued for the previous five calendar years for all onsite personnel on Contractor managed projects',
      'healthInfo',
      'tmha',
    );

    fillQValue(
      'Provide Lost Time Injury Frequency Rate (LTIFR) as defined for the previous five calendar years for all onsite personnel on Contractor managed projects. Additionally, provide as an attachment, the guidance note (or similar) for how the Tenderer defines a Lost Time Injury.',
      'healthInfo',
      'ltifr',
    );

    fillQValue(
      'Is your company willing to commit itself, its employees and all Sub-contractors, to implementing and being held to KPIs relating to critical risk management (CRM)?',
      'healthInfo',
      'isWillingToCommit',
    );

    fillQValue(
      'Is your company prepared to compile weekly and monthly safety statistics for the work performed on Site?',
      'healthInfo',
      'isPerparedToCompile',
    );

    fillQValue(
      'Has your company previously worked on World Bank or International Finance Corporation projects? If so provide details',
      'healthInfo',
      'hasWorkedOnWorldBank',
    );

    fillQValue(
      'Has your company previously worked on large scale mining construction projects? If so provide details.',
      'healthInfo',
      'hasWorkedOnLargeProjects',
    );

    fillQValue(
      'Has your company previously worked on large scale mining construction projects? If so provide details.',
      'healthInfo',
      'doesHaveLicense',
    );
  }

  fillSectionResult('Health & Safety Management System', 'healthInfo');

  return generateXlsx(workbook, 'company_prequalification');
};

export default generate;
