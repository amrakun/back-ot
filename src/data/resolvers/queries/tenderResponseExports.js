import cf from 'cellref';
import { Companies, Tenders, TenderResponses } from '../../../db/models';
import { encryptArray } from '../../../db/models/utils';
import { readTemplate, generateXlsx } from '../../utils';
import { moduleRequireBuyer } from '../../permissions';

const prepareReport = async ({ tenderId, supplierIds, template }) => {
  const tender = await Tenders.findOne({ _id: tenderId });

  const responses = await TenderResponses.find({
    tenderId,
    supplierId: { $in: encryptArray(supplierIds) },
  });

  // read template
  const { workbook, sheet } = await readTemplate(template);

  return { tender, responses, workbook, sheet };
};

const tenderResponseQueries = {
  /**
   * Generate bid summary report file
   * @param {String} tenderId - Tender id
   * @param {[String]} supplierIds - Selected supplier ids
   * @return {String} generated file link
   */
  async tenderResponsesRfqBidSummaryReport(root, { tenderId, supplierIds }, { user }) {
    const { tender, responses, workbook, sheet } = await prepareReport({
      tenderId,
      supplierIds,
      template: 'rfq_bid',
    });

    // date
    sheet.cell(1, 6).value(new Date().toLocaleDateString());

    // rfq number
    sheet.cell(2, 7).value(`RFQ ${tender.number}`);

    for (const [index, product] of tender.requestedProducts.entries()) {
      const rowIndex = 13 + index;

      // fill requested products section
      sheet.cell(rowIndex, 2).value(product.code);
      sheet.cell(rowIndex, 3).value(product.shortText);
      sheet.cell(rowIndex, 4).value(product.quantity);
      sheet.cell(rowIndex, 5).value(product.uom);
      sheet.cell(rowIndex, 6).value(product.manufacturer);
      sheet.cell(rowIndex, 7).value(product.manufacturerPartNumber);

      let columnIndex = 3;

      for (const response of responses) {
        const supplier = await Companies.findOne({ _id: response.supplierId });

        // find response by product code
        const rp = response.respondedProducts.find(p => p.code === product.code) || {};

        columnIndex += 5;

        // title
        sheet.cell(10, columnIndex).value(supplier.basicInfo.enName);

        // fill suppliers section
        sheet.cell(rowIndex, columnIndex).value(rp.leadTime);
        sheet.cell(rowIndex, columnIndex + 1).value(rp.unitPrice);
        sheet.cell(rowIndex, columnIndex + 2).value(product.quantity * rp.unitPrice);
        sheet.cell(rowIndex, columnIndex + 3).value(rp.suggestedManufacturer);
        sheet.cell(rowIndex, columnIndex + 4).value(rp.shippingTerms);
      }
    }

    return generateXlsx(user, workbook, `rfq_bid_summary_${tender._id}`);
  },

  /**
   * Generate eoi short list report file
   * @param {String} tenderId - Tender id
   * @param {[String]} supplierIds - Selected supplier ids
   * @return {String} generated file link
   */
  async tenderResponsesEoiShortList(root, { tenderId, supplierIds }, { user }) {
    const { tender, responses, workbook, sheet } = await prepareReport({
      tenderId,
      supplierIds,
      template: 'eoi_short_list',
    });

    const maxColumns = 2 + responses.length;

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
    return generateXlsx(user, workbook, `eoi_short_list${tender._id}`);
  },

  /**
   * Generate eoi bidder list report file
   * @param {String} tenderId - Tender id
   * @param {[String]} supplierIds - Selected supplier ids
   * @return {String} generated file link
   */
  async tenderResponsesEoiBidderList(root, { tenderId, supplierIds }, { user }) {
    const { tender, responses, workbook, sheet } = await prepareReport({
      tenderId,
      supplierIds,
      template: 'eoi_bidder_list',
    });

    let rowIndex = 21;

    // identified potential suppliers information ============
    let addRow = (colIndex, value) => {
      sheet
        .cell(rowIndex, colIndex)
        .style({ fontSize: 9 })
        .value(value);
    };

    for (let [index, response] of responses.entries()) {
      const supplier = await Companies.findOne({ _id: response.supplierId });
      const basicInfo = supplier.basicInfo || {};

      addRow(1, index + 1);
      addRow(2, basicInfo.enName);
      addRow(3, basicInfo.totalNumberOfEmployees);
      addRow(8, 'YES');

      // go down 1 line
      rowIndex++;
    }

    // go down 1 line and add JUSTIFICATION: text and merge next 9 cells ========
    sheet
      .range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex}C9`)}`)
      .merged(true)
      .style({ border: true })
      .value('JUSTIFICATION:');

    // go down 1 line and merge next 9 cells ========
    rowIndex++;
    sheet
      .range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex}C9`)}`)
      .merged(true)
      .value('');

    // go down 3 line and add below text ========
    rowIndex += 3;
    sheet
      .range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex}C9`)}`)
      .merged(true)
      .value(
        `DETAILED INFORMATION OF SUPPLIERS INCLUDED IN
      BIDDERS LIST ONLY: to be filled by sourcing analyst`,
      )
      .style({ bold: true });

    // go down 1 line ========
    rowIndex++;
    sheet.cell(rowIndex, 1).value('');

    // detailed information of suppliers ============
    // add header
    rowIndex++;
    sheet.cell(rowIndex, 1).value('#');
    sheet.cell(rowIndex, 2).value('REQUIRED INFO');
    sheet.cell(rowIndex, 3).value('DETAILS');
    sheet.range(`${cf(`R${rowIndex}C3`)}:${cf(`R${rowIndex}C9`)}`).merged(true);
    sheet
      .range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex}C9`)}`)
      .style({ fontColor: 'ffffff', fill: '595959', bold: true });

    addRow = (text, value) => {
      rowIndex++;
      sheet.cell(rowIndex, 2).value(text);
      sheet
        .cell(rowIndex, 3)
        .value(value)
        .style({ horizontalAlignment: 'left' });
      sheet.range(`${cf(`R${rowIndex}C3`)}:${cf(`R${rowIndex}C9`)}`).merged(true);
      sheet.range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex}C9`)}`).style({
        border: true,
        fontSize: 9,
      });
    };

    for (let [index, response] of responses.entries()) {
      const supplier = (await Companies.findOne({ _id: response.supplierId })) || {};
      const basicInfo = supplier.basicInfo || {};
      const contactInfo = supplier.contactInfo || {};

      addRow('SUPPLIER NAME', basicInfo.enName);

      // numbering
      sheet.cell(rowIndex, 1).value(index + 1);

      // merge index column cells
      sheet
        .range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex + 5}C1`)}`)
        .merged(true)
        .style({
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
          bold: true,
        });

      addRow('ADDRESS', contactInfo.address);
      addRow('TELEPHONE', contactInfo.phone);
      addRow('CONTACT PERSON', '');
      addRow('EMAIL ADDRESS', contactInfo.email);
      addRow('WEBSITE', contactInfo.website);

      // go down 1 line ========
      rowIndex++;
      sheet.range(`${cf(`R${rowIndex}C1`)}:${cf(`R${rowIndex}C3`)}`).value('');
    }

    sheet.usedRange().style({ fontFamily: 'Calibri' });

    // Write to file.
    return generateXlsx(user, workbook, `eoi_bidder_list${tender._id}`);
  },
};

moduleRequireBuyer(tenderResponseQueries);

export default tenderResponseQueries;
