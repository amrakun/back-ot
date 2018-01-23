import cf from 'cellref';
import { Companies, AuditResponses } from '../../../db/models';
import { CoreHseqInfoSchema, BusinessInfoSchema, HrInfoSchema } from '../../../db/models/Audits';
import { readTemplate, generateXlsx } from '../../utils';
import { moduleRequireBuyer } from '../../permissions';

const auditResponseQueries = {
  /**
   * Generate auditor improvement plan
   * @param {String} auditId - Audit id
   * @param {String} supplierId - Selected supplier id
   * @param {Date} auditDate - Audit date
   * @param {String} auditorName - Auditor name
   * @return {String} generated file link
   */
  async auditImprovementPlan(root, args) {
    const { auditId, supplierId, auditDate, reassessmentDate, auditorName } = args;

    const company = await Companies.findOne({ _id: supplierId });
    const auditResponse = await AuditResponses.findOne({ auditId, supplierId });

    const { workbook, sheet } = await readTemplate('auditor_improvement_plan');

    let rowIndex = 5;
    let cellPointer;

    // Fill main info =========================
    const basicInfo = company.basicInfo || {};

    const fillMainInfoCell = value => {
      rowIndex++;
      sheet.range(`${cf(`R${rowIndex}C5`)}:${cf(`R${rowIndex}C10`)}`).value(value);
    };

    // Supplier name
    fillMainInfoCell(basicInfo.enName);

    // Audit date
    fillMainInfoCell(auditDate.toLocaleString());

    // Planned review date
    fillMainInfoCell(reassessmentDate.toLocaleString());

    // QUALIFICATION AUDITOR(S) NAME(S)
    fillMainInfoCell(auditorName);

    // fill invalid answers =======================
    const invalidAnswers = [];

    const collectInvalidAnswers = (sectionName, schema) => {
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
        if (fieldValue.supplierAnswer) {
          invalidAnswers.push({
            label: fieldOptions.label.replace(/\s\s/g, ''),
            recommendation: fieldValue.supplierComment,
          });
        }
      });
    };

    collectInvalidAnswers('hrInfo', HrInfoSchema);
    collectInvalidAnswers('businessInfo', BusinessInfoSchema);
    collectInvalidAnswers('coreHseqInfo', CoreHseqInfoSchema);

    rowIndex += 3;

    invalidAnswers.forEach(answer => {
      // CRITERIA ( SHORT QUESTION DESCRIPTION)
      rowIndex++;
      cellPointer = `${cf(`R${rowIndex}C2`)}:${cf(`R${rowIndex}C3`)}`;
      sheet
        .range(cellPointer)
        .merged(true)
        .value(answer.label);

      // IMPROVEMENT ACTION (USE VERBS)
      cellPointer = `${cf(`R${rowIndex}C4`)}:${cf(`R${rowIndex}C7`)}`;
      sheet
        .range(cellPointer)
        .merged(true)
        .value(answer.recommendation);
    });

    rowIndex += 2;
    cellPointer = `${cf(`R${rowIndex}C2`)}:${cf(`R${rowIndex}C7`)}`;

    sheet.range(cellPointer).merged(true).value(`Acknowledged by
      …………………………………………………………( Supplier )`);

    rowIndex += 2;
    cellPointer = `${cf(`R${rowIndex}C2`)}:${cf(`R${rowIndex}C7`)}`;
    sheet
      .range(cellPointer)
      .merged(true)
      .value('Date:');

    return generateXlsx(workbook, `auditor_improvement_plan_${auditId}_${supplierId}`);
  },
};

moduleRequireBuyer(auditResponseQueries);

export default auditResponseQueries;
