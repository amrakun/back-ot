import { readTemplate, generateXlsx } from '../../utils';
import { FeedbackResponses, Companies } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const feedbackExports = {
  /**
   * Export feedback list
   * @return {String} - file url
   */
  async feedbackResponsesExport() {
    // read template
    const { workbook, sheet } = await readTemplate('success_feedback_responses');
    const responses = await FeedbackResponses.find({});

    let rowIndex = 4;

    for (let [index, response] of responses.entries()) {
      rowIndex++;

      const supplier = await Companies.findOne({ _id: response.supplierId });

      sheet.cell(rowIndex, 1).value(index + 1);
      sheet.cell(rowIndex, 2).value(supplier.basicInfo.enName);
      sheet.cell(rowIndex, 3).value(response.status);
      sheet.cell(rowIndex, 4).value(response.employmentNumberBefore);
      sheet.cell(rowIndex, 5).value(response.employmentNumberNow);
      sheet.cell(rowIndex, 6).value(response.nationalSpendBefore);
      sheet.cell(rowIndex, 7).value(response.nationalSpendAfter);
      sheet.cell(rowIndex, 8).value(response.umnugobiSpendBefore);
      sheet.cell(rowIndex, 9).value(response.umnugobiSpendAfter);
      sheet.cell(rowIndex, 10).value(response.investment);
      sheet.cell(rowIndex, 11).value(response.trainings);
      sheet.cell(rowIndex, 12).value(response.corporateSocial);
      sheet.cell(rowIndex, 13).value(response.technologyImprovement);
    }

    // Write to file.
    return generateXlsx(workbook, 'success_feedback_responses');
  },
};

moduleRequireBuyer(feedbackExports);

export default feedbackExports;
