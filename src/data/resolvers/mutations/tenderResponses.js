import cf from 'cellref';
import { Companies, Tenders, TenderResponses } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { readTemplate, generateXlsx } from '../../utils';

const tenderResponseMutations = {
  /**
   * Create new tender response
   * @param {Object} doc - tender response fields
   * @return {Promise} newly created tender reponse object
   */
  tenderResponsesAdd(root, doc) {
    return TenderResponses.createTenderResponse(doc);
  },

  /**
   * Generate bid summary report file
   * @param {String} tenderId - Tender id
   * @param {[String]} supplierIds - Selected supplier ids
   * @return {String} generated file link
   */
  async tenderResponsesRfqBidSummaryReport(root, { tenderId, supplierIds }) {
    const tender = await Tenders.findOne({ _id: tenderId });
    const responses = await TenderResponses.find({ tenderId, supplierId: { $in: supplierIds } });

    // read template
    const { workbook, sheet } = await readTemplate('rfq_bid');

    tender.requestedProducts.forEach((product, index) => {
      const rowIndex = 13 + index;

      // fill requested products section
      sheet.cell(rowIndex, 2).value(product.code);
      sheet.cell(rowIndex, 3).value(product.shortText);
      sheet.cell(rowIndex, 4).value(product.quantity);
      sheet.cell(rowIndex, 5).value(product.uom);
      sheet.cell(rowIndex, 6).value(product.manufacturer);
      sheet.cell(rowIndex, 7).value(product.manufacturerPartNumber);

      let columnIndex = 4;

      responses.forEach((response, index) => {
        // find response by product code
        const rp = response.respondedProducts.find(p => p.code === product.code);

        columnIndex += 4;

        // title
        sheet.cell(10, columnIndex).value(`Supplier${index + 1}`);

        // fill suppliers section
        sheet.cell(rowIndex, columnIndex).value(rp.leadTime);
        sheet.cell(rowIndex, columnIndex + 1).value(rp.unitPrice);
        sheet.cell(rowIndex, columnIndex + 2).value(rp.totalPrice);
        sheet.cell(rowIndex, columnIndex + 3).value(rp.suggestedManufacturer);
      });
    });

    return generateXlsx(workbook, `rfq_bid_summary_${tender._id}`);
  },

  /**
   * Generate eoi short list report file
   * @param {String} tenderId - Tender id
   * @param {[String]} supplierIds - Selected supplier ids
   * @return {String} generated file link
   */
  async tenderResponsesEoiShortList(root, { tenderId, supplierIds }) {
    const tender = await Tenders.findOne({ _id: tenderId });
    const responses = await TenderResponses.find({ tenderId, supplierId: { $in: supplierIds } });
    const maxColumns = 2 + responses.length;

    // read template
    const { workbook, sheet } = await readTemplate('eoi_short_list');

    // complete colored titles
    sheet.range(`${cf('R1C1')}:${cf(`R1C${maxColumns}`)}`).merged(true);
    sheet.range(`${cf('R12C1')}:${cf(`R12C${maxColumns}`)}`).merged(true);
    sheet.range(`${cf('R16C1')}:${cf(`R16C${maxColumns}`)}`).merged(true);
    sheet.range(`${cf('R18C2')}:${cf(`R18C${maxColumns}`)}`).merged(true);

    for (let [index, response] of responses.entries()) {
      const supplier = await Companies.findOne({ _id: response.supplierId });

      // evaluation sheet summary ============
      const basicInfo = supplier.basicInfo || {};
      const financialInfo = supplier.financialInfo || {};
      const annualTurnover = financialInfo.annualTurnover || [];
      const sortedAnnualTurnover = annualTurnover.sort((p, n) => p.year > n.year);
      const lastAnnualTurnover = sortedAnnualTurnover.pop() || {};

      sheet.cell(3, 3 + index).value(basicInfo.enName);
      sheet.cell(5, 3 + index).value(basicInfo.registrationNumber);
      sheet.cell(6, 3 + index).value(lastAnnualTurnover.amount);
      sheet.cell(7, 3 + index).value(basicInfo.totalNumberOfEmployees);
      sheet.cell(8, 3 + index).value(basicInfo.totalNumberOfMongolianEmployees);
      sheet.cell(9, 3 + index).value(basicInfo.totalNumberOfUmnugoviEmployees);

      let score = 0;

      for (let [i, document] of response.respondedDocuments.entries()) {
        // documents info
        sheet.cell(19 + i, 1).value(i + 1);
        sheet.cell(19 + i, 2).value(document.name);
        sheet.cell(19 + i, 3 + index).value(document.isSubmitted);

        if (document.isSubmitted) {
          score++;
        }
      }

      // overall points
      sheet.cell(14, 3 + index).value(score);
    }

    // Write to file.
    return generateXlsx(workbook, `eoi_short_list${tender._id}`);
  },
};

moduleRequireLogin(tenderResponseMutations);

export default tenderResponseMutations;
