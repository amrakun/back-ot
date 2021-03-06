import { readTemplate, generateXlsx } from '../../utils';
import { FeedbackResponses, Companies } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';
import { supplierFilter } from './utils';

const feedbackExports = {
  /**
   * Export feedback list
   * @return {String} - file url
   */
  async feedbackResponsesExport(root, { supplierName, responseIds }, { user }) {
    // read template
    const { workbook, sheet } = await readTemplate('success_feedback_responses');

    // filter responses ==========
    let query = await supplierFilter({}, supplierName);

    if (responseIds) {
      query = { _id: { $in: responseIds } };
    }

    const responses = await FeedbackResponses.find(query);

    let rowIndex = 4;

    for (let [index, response] of responses.entries()) {
      rowIndex++;

      const supplier = await Companies.findOne({ _id: response.supplierId });

      sheet.cell(rowIndex, 1).value(index + 1);
      sheet.cell(rowIndex, 2).value(supplier.basicInfo.enName);
      sheet.cell(rowIndex, 3).value(response.status);

      sheet.cell(rowIndex, 4).value(response.totalEmploymentOt);
      sheet.cell(rowIndex, 5).value(response.totalEmploymentUmnugovi);
      sheet.cell(rowIndex, 6).value(response.employmentChangesAfter);

      sheet.cell(rowIndex, 7).value(response.numberOfEmployeeWorkToScopeNational);
      sheet.cell(rowIndex, 8).value(response.numberOfEmployeeWorkToScopeUmnugovi);

      sheet.cell(rowIndex, 9).value(response.procurementTotalSpend);
      sheet.cell(rowIndex, 10).value(response.procurementNationalSpend);
      sheet.cell(rowIndex, 11).value(response.procurementUmnugoviSpend);

      sheet.cell(rowIndex, 12).value(response.corporateSocial);
      sheet.cell(rowIndex, 13).value(response.otherStories);
    }

    // Write to file.
    return generateXlsx(user, workbook, 'success_feedback_responses');
  },
};

moduleRequireBuyer(feedbackExports);

export default feedbackExports;
