import { readTemplate, generateXlsx } from '../../utils';

/**
 * Export tenders
 * @param [Object] tenders - Filtered tenders
 * @return {String} - file url
 */
export const tendersExport = async tenders => {
  // read template
  const { workbook, sheet } = await readTemplate('tenders');

  let rowIndex = 1;

  for (let tender of tenders) {
    rowIndex++;

    sheet.cell(rowIndex, 1).value(tender.status);
    sheet.cell(rowIndex, 2).value(tender.number);
    sheet.cell(rowIndex, 3).value(tender.name);
    sheet.cell(rowIndex, 4).value(new Date(tender.publishDate).toLocaleDateString());
    sheet.cell(rowIndex, 5).value(new Date(tender.closeDate).toLocaleDateString());
    sheet.cell(rowIndex, 6).value(tender.requestedCount());
    sheet.cell(rowIndex, 7).value(await tender.submittedCount());
    sheet.cell(rowIndex, 8).value(await tender.notInterestedCount());
    sheet.cell(rowIndex, 9).value(await tender.notRespondedCount());
    sheet.cell(rowIndex, 10).value(await tender.sourcingOfficer);
    sheet.cell(rowIndex, 11).value((await tender.sentRegretLetter) ? 'YES' : 'NO');
  }

  // Write to file.
  return generateXlsx(workbook, 'tenders');
};

/**
 * Generate tender materials template for supplier
 * @param Object tender - Tender object
 * @return {String} - file url
 */
export const tenderGenerateMaterialsTemplate = async tender => {
  // read template
  const { workbook, sheet } = await readTemplate('rfq_responded_products');

  const requestedProducts = tender.requestedProducts;

  let rowIndex = 1;

  for (const product of requestedProducts) {
    rowIndex++;

    sheet.cell(rowIndex, 1).value(product.code);
    sheet.cell(rowIndex, 2).value(product.purchaseRequestNumber);
    sheet.cell(rowIndex, 3).value(product.shortText);
    sheet.cell(rowIndex, 4).value(product.quantity);
    sheet.cell(rowIndex, 5).value(product.uom);
    sheet.cell(rowIndex, 6).value(product.manufacturer);
    sheet.cell(rowIndex, 7).value(product.manufacturerPartNumber);
  }

  // Write to file.
  return generateXlsx(workbook, 'rfq_responded_products');
};
