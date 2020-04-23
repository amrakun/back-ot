import cf from 'cellref';
import { Companies, AuditResponses, Audits } from '../../../db/models';
import { CoreHseqInfoSchema, BusinessInfoSchema, HrInfoSchema } from '../../../db/models/Audits';
import { readTemplate, generateXlsx, uploadToS3 } from '../../utils';
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

    // Fill main info =========================
    const basicInfo = company.basicInfo || {};

    const fillMainInfoCell = value => {
      rIndex++;
      sheet.range(`${cf(`R${rIndex}C5`)}:${cf(`R${rIndex}C10`)}`).value(value);
    };

    // Supplier name
    fillMainInfoCell(basicInfo.enName);

    // Result
    fillMainInfoCell('Not qualified with improvement plan');

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
            label: (fieldOptions.labelMn || '').replace(/\s\s/g, ''),
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

        fill(`${cf(`R${rIndex}C2`)}:${cf(`R${rIndex}C4`)}`, answer.label, { wrapText: true });

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

    const key = `audits/auditor_improvement_plan_${auditId}_${supplierId}.xlsx`;

    // save to s3
    const file = await workbook.outputAsync('buffer');
    await uploadToS3(key, file);

    await auditResponse.update({ improvementPlanFile: key });

    return key;
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
    const { auditId, supplierId, auditDate, auditor, reportLanguage } = args;

    const company = await Companies.findOne({ _id: supplierId });
    const auditResponse = await AuditResponses.findOne({ auditId, supplierId });

    const { workbook, sheet } = await readTemplate(`auditor_report_${reportLanguage}`);

    const bi = company.basicInfo || {};

    const fillRange = (row, col, value, aligment = 'left') =>
      sheet
        .range(`${cf(row)}:${cf(col)}`)
        .merged(true)
        .style({ horizontalAlignment: aligment, wrapText: true })
        .value(fixValue(value));

    const translations = {
      coreHseqInfo: { en: 'HSEQ Criteria', mn: 'ЭМААБОЧ-ын шалгуур' },
      hrInfo: { en: 'HR Criteria', mn: 'Хүний нөөцийн шалгуур' },
      businessInfo: { en: 'Supplier Score', mn: 'Бизнесийн ёс зүйн шалгуур' },
      supplierScore: { en: 'Supplier score', mn: 'Нийлүүлэгчийн оноо' },
      auditorScore: { en: 'Auditor score', mn: 'Аудиторын оноо' },
      supplierComment: { en: 'Supplier comment', mn: 'Нийлүүлэгчийн тайлбар' },
      auditorComment: { en: 'Auditor comment', mn: 'Аудиторын тайлбар' },
      recommendation: { en: 'Recommendation', mn: 'Зөвлөмж' },
    };

    // Supplier name
    fillRange('R2C5', 'R2C10', bi.enName, 'center');

    // Audit date
    fillRange('R4C5', 'R4C10', auditDate.toLocaleDateString());

    // Audit name
    fillRange('R5C5', 'R5C10', auditor);

    // Tier type
    fillRange('R7C5', 'R7C10', company.tierType);

    // number of employees
    fillRange('R10C5', 'R10C10', bi.totalNumberOfEmployees);

    // experience
    fillRange('R12C5', 'R12C10', (auditResponse.basicInfo || {}).otExperience);

    // sotri
    fillRange('R13C5', 'R13C10', (auditResponse.basicInfo || {}).sotri);

    // sotie
    fillRange('R14C5', 'R14C10', (auditResponse.basicInfo || {}).sotie);

    let rIndex = 14;

    // main result
    let isQualified = true;

    const renderSection = (sectionName, schema, extraAction) => {
      rIndex += 1;

      fillRange(
        `R${rIndex}C2`,
        `R${rIndex}C10`,
        translations[sectionName][reportLanguage],
        'left',
      ).style({
        verticalAlignment: 'center',
        fill: '31869B',
        fontColor: 'ffffff',
        bold: true,
        fontSize: 16,
      });

      sheet.row(rIndex).height(30);

      const paths = schema.paths;

      // doesHaveHealthSafety, doesHaveDocumentedPolicy ...
      const fieldNames = Object.keys(paths);

      // doesHaveHealthSafety: {...},  doesHaveDocumentedPolicy: {...},
      const sectionValue = auditResponse[sectionName] || {};

      fieldNames.forEach((fieldName, fieldIndex) => {
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

        const label = fieldOptions[`label${reportLanguage === 'mn' ? 'Mn' : ''}`].replace(
          /\s\s/g,
          '',
        );

        const titleStyle = {
          wrapText: true,
          fill: 'F79646',
          verticalAlignment: 'center',
          border: true,
        };

        sheet.row(rIndex).height(30);

        fillRange(`R${rIndex}C1`, `R${rIndex}C1`, fieldIndex + 1, 'left').style({
          verticalAlignment: 'center',
          horizontalAlignment: 'center',
          bold: true,
          fill: 'ffffff',
          fontSize: 16,
          border: false,
        });
        fillRange(`R${rIndex}C2`, `R${rIndex}C4`, label, 'left').style(titleStyle);
        fillRange(
          `R${rIndex}C5`,
          `R${rIndex}C7`,
          translations.supplierScore[reportLanguage],
          'center',
        ).style(titleStyle);
        fillRange(
          `R${rIndex}C8`,
          `R${rIndex}C10`,
          translations.auditorScore[reportLanguage],
          'center',
        ).style(titleStyle);

        const fillAnswers = value => {
          rIndex++;

          fillRange(`R${rIndex}C2`, `R${rIndex}C4`, value, 'left').style({
            verticalAlignment: 'top',
            border: true,
          });

          sheet.row(rIndex).height(50);
        };

        fillAnswers(
          `${translations.supplierComment[reportLanguage]}: ${fieldValue.supplierComment}`,
        );
        fillAnswers(`${translations.auditorComment[reportLanguage]}: ${fieldValue.auditorComment}`);
        fillAnswers(
          `${translations.recommendation[reportLanguage]}: ${fieldValue.auditorRecommendation}`,
        );

        fillRange(
          `R${rIndex - 2}C5`,
          `R${rIndex}C7`,
          fixValue(fieldValue.supplierAnswer),
          'center',
        ).style({
          verticalAlignment: 'center',
          fontSize: 16,
          border: true,
        });

        fillRange(
          `R${rIndex - 2}C8`,
          `R${rIndex}C10`,
          fixValue(fieldValue.auditorScore),
          'center',
        ).style({
          verticalAlignment: 'center',
          fontSize: 16,
          border: true,
        });

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

    renderSection('coreHseqInfo', CoreHseqInfoSchema);
    renderSection('hrInfo', HrInfoSchema);
    renderSection('businessInfo', BusinessInfoSchema);

    // Audit result
    fillRange('R3C5', 'R3C10', isQualified ? 'qualified' : 'Not qualified with improvement plan');

    const key = `audits/auditor_report_${auditId}_${supplierId}.xlsx`;

    // save to s3
    const file = await workbook.outputAsync('buffer');
    await uploadToS3(key, file);

    await auditResponse.update({ reportFile: key });

    return key;
  },

  async auditExportResponses(root, args, { user }) {
    // read template
    const { workbook, sheet } = await readTemplate('audit_responses');

    const responses = await AuditResponses.find({});

    let rowIndex = 4;

    for (let [index, response] of responses.entries()) {
      rowIndex++;

      const audit = await Audits.findOne({ _id: response.auditId });
      const supplier = await Companies.findOne({ _id: response.supplierId });

      sheet.cell(rowIndex, 1).value(index + 1);
      sheet.cell(rowIndex, 2).value(audit.status);
      sheet.cell(rowIndex, 3).value(supplier.basicInfo.enName);
      sheet.cell(rowIndex, 4).value(supplier.basicInfo.sapNumber);
      sheet.cell(rowIndex, 5).value(supplier.tierType);

      sheet.cell(rowIndex, 6).value(supplier.qualificationStatusDisplay());
      sheet.cell(rowIndex, 7).value(response.status === 'invited' ? 'invited' : 'submitted');
      sheet.cell(rowIndex, 8).value(audit.publishDate.toLocaleDateString());
      sheet.cell(rowIndex, 9).value(audit.closeDate.toLocaleDateString());
      sheet
        .cell(rowIndex, 10)
        .value(response.sentDate ? response.sentDate.toLocaleDateString() : '');
      sheet.cell(rowIndex, 11).value(response.status ? response.status : 'Not responeded');
      sheet.cell(rowIndex, 12).value(response.reportFile);
      sheet.cell(rowIndex, 13).value(response.improvementPlanFile);
    }

    // Write to file.
    return generateXlsx(user, workbook, 'audit_responses');
  },
};

moduleRequireBuyer(auditResponseQueries);

export default auditResponseQueries;
