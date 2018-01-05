import { Tenders, TenderResponses } from '../../../db/models';
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
  async tenderResponsesBidSummaryReport(root, { tenderId, supplierIds }) {
    const tender = await Tenders.findOne({ _id: tenderId });
    const responses = await TenderResponses.find({ tenderId, supplierId: { $in: supplierIds } });

    // read template
    const { workbook, firstSheet } = await readTemplate('rfq_bid');

    tender.requestedProducts.forEach((product, index) => {
      const rowIndex = 13 + index;

      // fill requested products section
      firstSheet.cell(rowIndex, 2).value(product.code);
      firstSheet.cell(rowIndex, 3).value(product.shortText);
      firstSheet.cell(rowIndex, 4).value(product.quantity);
      firstSheet.cell(rowIndex, 5).value(product.uom);
      firstSheet.cell(rowIndex, 6).value(product.manufacturer);
      firstSheet.cell(rowIndex, 7).value(product.manufacturerPartNumber);

      let columnIndex = 4;

      responses.forEach((response, index) => {
        // find response by product code
        const rp = response.respondedProducts.find(p => p.code === product.code);

        columnIndex += 4;

        // title
        firstSheet.cell(10, columnIndex).value(`Supplier${index + 1}`);

        // fill suppliers section
        firstSheet.cell(rowIndex, columnIndex).value(rp.leadTime);
        firstSheet.cell(rowIndex, columnIndex + 1).value(rp.unitPrice);
        firstSheet.cell(rowIndex, columnIndex + 2).value(rp.totalPrice);
        firstSheet.cell(rowIndex, columnIndex + 3).value(rp.suggestedManufacturer);
      });
    });

    return generateXlsx(workbook, `bid_summary_${tender._id}`);
  },
};

moduleRequireLogin(tenderResponseMutations);

export default tenderResponseMutations;
