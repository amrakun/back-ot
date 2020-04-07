import cf from 'cellref';
import { Companies, AuditResponses } from '../../../db/models';
import { CoreHseqInfoSchema, BusinessInfoSchema, HrInfoSchema } from '../../../db/models/Audits';
import { readTemplate, generateXlsx } from '../../utils';
import { moduleRequireBuyer } from '../../permissions';
import { fixValue } from './utils';

const auditResponseQueries = {
  /**
   * Generate auditor improvement plan
   * @param {String} auditId - Audit id
   * @param {String} supplierId - Selected supplier id
   * @param {Date} auditDate - Audit date
   * @param {String} auditor - Auditor name
   * @return {String} generated file link
   */
  async auditImprovementPlan(root, args, { user }) {
    const { auditId, supplierId, auditDate, reassessmentDate, auditor } = args;

    const company = await Companies.findOne({ _id: supplierId });
    const auditResponse = await AuditResponses.findOne({ auditId, supplierId });

    const { workbook, sheet } = await readTemplate('auditor_improvement_plan');

    let rIndex = 1;
    let cellPointer;

    // Fill main info =========================
    const basicInfo = company.basicInfo || {};

    const fillMainInfoCell = value => {
      rIndex++;
      sheet.range(`${cf(`R${rIndex}C5`)}:${cf(`R${rIndex}C10`)}`).value(value);
    };

    // Supplier name
    fillMainInfoCell(basicInfo.enName);

    // Result
    fillMainInfoCell('Not qualified');

    // Audit date
    fillMainInfoCell(auditDate.toLocaleDateString());

    // Planned review date
    fillMainInfoCell(reassessmentDate.toLocaleDateString());

    // QUALIFICATION AUDITOR(S) NAME(S)
    fillMainInfoCell(auditor);

    // fill invalid answers =======================
    const collectInvalidAnswers = (sectionName, title, schema) => {
      const invalidAnswers = [];

      const paths = schema.paths;

      // doesHaveHealthSafety, doesHaveDocumentedPolicy ...
      const fieldNames = Object.keys(paths);

      // doesHaveHealthSafety: {...},  doesHaveDocumentedPolicy: {...},
      const sectionValue = auditResponse[sectionName] || {};

      fieldNames.forEach(fieldName => {
        // supplierComment: comment
        // supplierAnswer: yes
        // auditorComment: comment
        // auditorRecommendation: recommendation
        // auditorScore: no
        const fieldValue = sectionValue[fieldName] || {};
        const fieldOptions = paths[fieldName].options;

        // collect only wrong answers
        if (!fieldValue.auditorScore) {
          invalidAnswers.push({
            label: fieldOptions.label.replace(/\s\s/g, ''),
            recommendation: fieldValue.auditorRecommendation,
            supplierAnswer: fieldValue.supplierAnswer,
            auditorScore: fieldValue.auditorScore,
          });
        }
      });

      if (invalidAnswers.lenght === 0) {
        return;
      }

      rIndex++;

      // title
      sheet
        .range(`${cf(`R${rIndex}C2`)}:${cf(`R${rIndex}C10`)}`)
        .merged(true)
        .style({ fill: '31869B', fontColor: 'ffffff', fontSize: 16 })
        .value(title);

      invalidAnswers.forEach((answer, answerIndex) => {
        const fill = (cellPointer, value, style = {}) =>
          sheet
            .range(cellPointer)
            .merged(true)
            .style({ verticalAlignment: 'center', fill: 'F79646', border: true, ...style })
            .value(value);

        // CRITERIA ( SHORT QUESTION DESCRIPTION)
        rIndex++;

        sheet.row(rIndex).height(30);

        // index
        fill(`${cf(`R${rIndex}C1`)}:${cf(`R${rIndex}C1`)}`, answerIndex + 1, {
          horizontalAlignment: 'center',
          fill: 'ffffff',
          fontSize: 16,
          border: false,
        });

        fill(`${cf(`R${rIndex}C2`)}:${cf(`R${rIndex}C4`)}`, answer.label);

        // supplier point
        fill(`${cf(`R${rIndex}C5`)}:${cf(`R${rIndex}C7`)}`, 'Нийлүүлэгчийн оноо', {
          horizontalAlignment: 'center',
        });

        // auditor point
        fill(`${cf(`R${rIndex}C8`)}:${cf(`R${rIndex}C10`)}`, 'Аудиторын оноо', {
          horizontalAlignment: 'center',
        });

        // RECOMMENDATION ========
        rIndex++;

        sheet.row(rIndex).height(50);

        // recommendation
        fill(`${cf(`R${rIndex}C2`)}:${cf(`R${rIndex}C4`)}`, `Зөвлөмж: ${answer.recommendation}`, {
          fill: 'ffffff',
          verticalAlignment: 'top',
        });

        // supplier point
        fill(`${cf(`R${rIndex}C5`)}:${cf(`R${rIndex}C7`)}`, fixValue(answer.supplierAnswer), {
          fill: 'ffffff',
          horizontalAlignment: 'center',
        });

        // auditro point
        fill(`${cf(`R${rIndex}C8`)}:${cf(`R${rIndex}C10`)}`, fixValue(answer.auditorScore), {
          fill: 'ffffff',
          horizontalAlignment: 'center',
        });
      });
    };

    collectInvalidAnswers('coreHseqInfo', 'ЭМААБОЧ-ын шалгуур', CoreHseqInfoSchema);
    collectInvalidAnswers('hrInfo', 'Хүний нөөцийн шалгуур', HrInfoSchema);
    collectInvalidAnswers('businessInfo', 'Бизнесийн ёс зүйн шалгуур', BusinessInfoSchema);

    // generate file
    const path = await generateXlsx(
      user,
      workbook,
      `auditor_improvement_plan_${auditId}_${supplierId}`,
    );

    await auditResponse.update({ improvementPlanFile: path });

    return path;
  },

  /**
   * Generate auditor improvement plan
   * @param {String} auditId - Audit id
   * @param {String} supplierId - Selected supplier id
   * @param {Date} auditDate - Audit date
   * @param {String} auditor - Auditor
   * @param {String} reportNo - Report no
   * @return {String} generated file link
   */
  async auditReport(root, args, { user }) {
    const { auditId, supplierId, auditDate, auditor, reportNo } = args;

    const company = await Companies.findOne({ _id: supplierId });
    const auditResponse = await AuditResponses.findOne({ auditId, supplierId });

    const { workbook, sheet } = await readTemplate('auditor_report');

    const bi = company.basicInfo || {};

    const fillRange = (row, col, value, aligment = 'left') =>
      sheet
        .range(`${cf(row)}:${cf(col)}`)
        .merged(true)
        .style({ horizontalAlignment: aligment })
        .value(fixValue(value));

    const fillCell = (rIndex, colIndex, value, aligment = 'left') =>
      sheet
        .cell(rIndex, colIndex)
        .style({ horizontalAlignment: aligment })
        .value(fixValue(value));

    // Supplier name
    fillRange('R19C3', 'R19C9', bi.enName, 'center');

    // Audit date
    fillRange('R26C6', 'R26C7', auditDate.toLocaleDateString());

    // Audit name
    fillRange('R28C6', 'R28C10', auditor);

    // Report no
    fillRange('R56C4', 'R56C6', reportNo);

    // Company name
    fillRange('R56C9', 'R56C10', bi.enName);

    // Auditor
    fillRange('R57C4', 'R59C6', auditor);

    // Audit date
    fillRange('R60C4', 'R60C6', auditDate.toLocaleDateString());

    // Tier type
    fillCell(64, 10, company.tierType);

    // number of employees
    fillCell(67, 10, bi.totalNumberOfEmployees);

    // sotri
    fillCell(70, 10, (auditResponse.basicInfo || {}).sotri);

    // sotie
    fillCell(71, 10, (auditResponse.basicInfo || {}).sotie);

    // short =======================

    const titleStyle = { verticalAlignment: 'center', fill: 'FDE9D9', bold: true };

    // core hseq
    let rIndex = 77;

    // main result
    let isQualified = true;

    const renderSection = (sectionName, sectionTitle, schema, extraAction) => {
      rIndex += 2;

      fillRange(`R${rIndex}C2`, `R${rIndex + 1}C5`, sectionTitle, 'center').style(titleStyle);

      fillRange(`R${rIndex}C6`, `R${rIndex + 1}C8`, 'Supplier Assessment', 'center').style(
        titleStyle,
      );

      fillRange(`R${rIndex}C9`, `R${rIndex + 1}C10`, 'Auditor Assessment', 'center').style(
        titleStyle,
      );
      const paths = schema.paths;

      // doesHaveHealthSafety, doesHaveDocumentedPolicy ...
      const fieldNames = Object.keys(paths);

      // doesHaveHealthSafety: {...},  doesHaveDocumentedPolicy: {...},
      const sectionValue = auditResponse[sectionName] || {};

      rIndex++;

      fieldNames.forEach(fieldName => {
        rIndex++;

        // supplierComment: comment
        // supplierAnswer: yes
        // auditorComment: comment
        // auditorRecommendation: recommendation
        // auditorScore: no
        const fieldValue = sectionValue[fieldName] || {};
        const supplierAnswer = fixValue(fieldValue.supplierAnswer);
        const auditorScore = fixValue(fieldValue.auditorScore);

        // if auditor replied as no or gave 0 score then consider this
        // supplier as not qualified
        if (auditorScore === 'NO' || auditorScore === 0) {
          isQualified = false;
        }

        const fieldOptions = paths[fieldName].options;

        const label = fieldOptions.label.replace(/\s\s/g, '');

        fillRange(`R${rIndex}C2`, `R${rIndex}C5`, label);
        fillRange(`R${rIndex}C6`, `R${rIndex}C8`, supplierAnswer, 'center');
        fillRange(`R${rIndex}C9`, `R${rIndex}C10`, auditorScore), 'center';

        if (extraAction) {
          extraAction({
            supplierComment: fieldValue.supplierComment,
            auditorComment: fieldValue.auditorComment,
            supplierAnswer,
            auditorScore,
          });
        }
      });
    };

    renderSection('coreHseqInfo', 'Core HSEQ Criteria', CoreHseqInfoSchema);
    renderSection('businessInfo', 'Business integrity Criteria', BusinessInfoSchema);
    renderSection('hrInfo', 'Human resource management  Criteria', HrInfoSchema);

    // Audit result: not qualified
    if (!isQualified) {
      fillCell(72, 6, 'Not qualified with improvement plan').style({
        fill: 'ff0000',
        fontColor: 'ffffff',
      });
    }

    rIndex += 2;

    // third section ============================
    fillRange(
      `R${rIndex}C2`,
      `R${rIndex}C10`,
      'Rio Tinto - Oyu Tolgoi LLC - Supplier Qualification',
      'center',
    );

    rIndex += 2;

    const extraAction = ({ supplierComment, auditorComment, auditorRecommendation }) => {
      rIndex += 3;
      fillRange(`R${rIndex}C2`, `R${rIndex}C10`, 'Supplier comments').style({ bold: true });
      fillRange(`R${rIndex + 1}C2`, `R${rIndex + 2}C10`, supplierComment).style({ border: true });

      rIndex += 4;
      fillRange(`R${rIndex}C2`, `R${rIndex}C10`, 'Auditor comment').style({ bold: true });
      fillRange(`R${rIndex + 1}C2`, `R${rIndex + 2}C10`, auditorComment).style({ border: true });

      rIndex += 4;
      fillRange(`R${rIndex}C2`, `R${rIndex}C10`, 'Auditor recommendation').style({ bold: true });
      fillRange(`R${rIndex + 1}C2`, `R${rIndex + 2}C10`, auditorRecommendation).style({
        border: true,
      });

      rIndex += 4;
      fillRange(`R${rIndex}C2`, `R${rIndex}C10`, 'Evidence').style({ bold: true });
      fillRange(`R${rIndex + 1}C2`, `R${rIndex + 2}C10`, '').style({ border: true });

      rIndex += 4;
    };

    renderSection('coreHseqInfo', 'Core HSEQ Criteria', CoreHseqInfoSchema, extraAction);

    renderSection('businessInfo', 'Business integrity Criteria', BusinessInfoSchema, extraAction);

    renderSection('hrInfo', 'Human resource management  Criteria', HrInfoSchema, extraAction);

    // generate file
    const path = await generateXlsx(user, workbook, `auditor_report_${auditId}_${supplierId}`);

    await auditResponse.update({ reportFile: path });

    return path;
  },
};

moduleRequireBuyer(auditResponseQueries);

export default auditResponseQueries;
