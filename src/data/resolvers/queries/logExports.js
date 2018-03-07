import { readTemplate, generateXlsx } from '../../utils';
import {
  TenderResponseLogs,
  Users,
  Companies,
  SearchLogs,
  Tenders,
  SuppliersByProductCodeLogs,
} from '../../../db/models';

export const buildSupplierLoginsLog = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('logs_supplier_logins');

  // supplier logins
  const items = await Users.aggregate([
    {
      $match: {
        isSupplier: true,
        lastLoginDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        lastLoginDate: { $max: '$lastLoginDate' },
      },
    },
  ]);

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${items.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item._id });
    const company = await Companies.findOne({ _id: user.companyId });

    if (company && company.basic) {
      sheet.cell(rowIndex, 2).value(company.basic.sapNumber);
    }

    if (company && company.contact) {
      sheet.cell(rowIndex, 3).value(company.contact.name);
    }

    sheet.cell(rowIndex, 4).value(user.username);
    sheet.cell(rowIndex, 5).value(user.email);
    sheet.cell(rowIndex, 6).value(item.lastLoginDate.toLocaleDateString('mn-MN'));
    sheet.cell(rowIndex, 7).value(item.lastLoginDate.toLocaleTimeString('mn-MN'));

    rowIndex++;
  }

  return generateXlsx(workbook, 'logs_supplier_logins');
};

export const buildBuyerLoginsLog = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('logs_buyer_logins');

  // buyer logins
  const items = await Users.aggregate([
    {
      $match: {
        isSupplier: { $ne: true },
        lastLoginDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: { _id: '$_id', companyId: '$companyId' },
        lastLoginDate: { $max: '$lastLoginDate' },
      },
    },
  ]);

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${items.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item._id });
    sheet.cell(rowIndex, 2).value(user.username);
    sheet.cell(rowIndex, 3).value(user.email);
    sheet.cell(rowIndex, 4).value(item.lastLoginDate.toLocaleDateString('mn-MN'));
    sheet.cell(rowIndex, 5).value(item.lastLoginDate.toLocaleTimeString('mn-MN'));

    rowIndex++;
  }

  // Write to file.
  return generateXlsx(workbook, 'logs_buyer_logins');
};

export const buildSupplierLoginsByEoiSubmissions = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('logs_supplier_logins_by_eoi_submissions');

  // supplier logins by eoi submissions
  const items = await TenderResponseLogs.find({
    tenderType: 'eoi',
    createdDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${items.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item.userId });
    const company = await Companies.findOne({ _id: user.companyId });

    if (company && company.basic) {
      sheet.cell(rowIndex, 2).value(company.basic.sapNumber);
    }

    if (company && company.contact) {
      sheet.cell(rowIndex, 3).value(company.contact.name);
    }

    sheet.cell(rowIndex, 4).value(user.username);
    sheet.cell(rowIndex, 5).value(user.email);
    sheet.cell(rowIndex, 6).value(item.createDate.toLocaleDateString('mn-MN'));
    sheet.cell(rowIndex, 7).value(item.createDate.toLocaleTimeString('mn-MN'));

    rowIndex++;
  }

  // Write to file.
  return generateXlsx(workbook, 'logs_supplier_logins_by_eoi_submissions');
};

export const buildSupplierLoginsByRfqSubmissions = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('logs_supplier_logins_by_rfq_submissions');

  // supplier logins by rfq submissions
  const items = await TenderResponseLogs.find({
    tenderType: 'rfq',
    createdDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  let rowIndex = 3;
  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${items.length}`);
  sheet
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item.userId });
    const company = await Companies.findOne({ _id: user.companyId });

    if (company && company.basic) {
      sheet.cell(rowIndex, 2).value(company.basic.sapNumber);
    }

    if (company && company.contact) {
      sheet.cell(rowIndex, 3).value(company.contact.name);
    }

    sheet.cell(rowIndex, 4).value(user.username);
    sheet.cell(rowIndex, 5).value(user.email);
    sheet.cell(rowIndex, 6).value(item.createDate.toLocaleDateString('mn-MN'));
    sheet.cell(rowIndex, 7).value(item.createDate.toLocaleTimeString('mn-MN'));

    rowIndex++;
  }
  return generateXlsx(workbook, 'logs_supplier_logins_by_rfq_submissions');
};

export const buildSearchesPerBuyer = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('searches_per_buyer');

  // Searches per buyer (search logs)
  const items = await SearchLogs.find({
    createdDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${items.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item.userId });

    sheet.cell(rowIndex, 2).value(user.username);
    sheet.cell(rowIndex, 3).value(user.email);
    sheet.cell(rowIndex, 4).value(item.numberOfSearches);

    rowIndex++;
  }

  return generateXlsx(workbook, 'searches_per_buyer');
};

export const buildEoiCreatedAndSentExport = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('eoi_created_and_sent');

  let groupedItemsAllCount = await Tenders.aggregate([
    {
      $match: {
        type: 'eoi',
        createdDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$createdUserId',
        count: { $sum: 1 },
      },
    },
  ]);

  let groupedItemsPublishedCount = await Tenders.aggregate([
    {
      $match: {
        type: 'eoi',
        createdDate: {
          $gte: startDate,
          $lt: endDate,
        },
        publishDate: {
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$createdUserId',
        count: { $sum: 1 },
      },
    },
  ]);

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${groupedItemsAllCount.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of groupedItemsAllCount) {
    const user = await Users.findOne({ _id: item._id });

    sheet.cell(rowIndex, 2).value(user.username);
    sheet.cell(rowIndex, 3).value(user.email);
    sheet.cell(rowIndex, 4).value(item.count);

    let publishedCount = 0;
    for (let publishedCountItem of groupedItemsPublishedCount) {
      if (publishedCountItem._id == item._id) {
        publishedCount = publishedCountItem.count;
        break;
      }
    }

    sheet.cell(rowIndex, 5).value(publishedCount);

    rowIndex++;
  }

  return generateXlsx(workbook, 'eoi_created_and_sent');
};

export const buildRfqCreatedAndSentExport = async ({ startDate, endDate }, user) => {
  const { workbook, sheet } = await readTemplate('rfq_created_and_sent');

  // RFQ created and sent
  const groupedItemsAllCount = await Tenders.aggregate([
    {
      $match: {
        type: 'rfq',
        createdDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$createdUserId',
        count: { $sum: 1 },
      },
    },
  ]);

  const groupedItemsPublishedCount = await Tenders.aggregate([
    {
      $match: {
        type: 'rfq',
        createdDate: {
          $gte: startDate,
          $lt: endDate,
        },
        publishDate: {
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$createdUserId',
        count: { $sum: 1 },
      },
    },
  ]);

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${groupedItemsAllCount.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of groupedItemsAllCount) {
    const user = await Users.findOne({ _id: item._id });

    sheet.cell(rowIndex, 2).value(user.username);
    sheet.cell(rowIndex, 3).value(user.email);
    sheet.cell(rowIndex, 4).value(item.count);

    let publishedCount = 0;
    for (let publishedCountItem of groupedItemsPublishedCount) {
      if (publishedCountItem._id == item._id) {
        publishedCount = publishedCountItem.count;
        break;
      }
    }

    sheet.cell(rowIndex, 5).value(publishedCount);

    rowIndex++;
  }

  // Write to file.
  return generateXlsx(workbook, 'rfq_created_and_sent');
};

export const buildSuppliersByProductCodeLogsExport = async (
  { startDate, endDate, productCodes },
  user,
) => {
  const { workbook, sheet } = await readTemplate('suppliers_by_product_code_logs_export');

  const items = await SuppliersByProductCodeLogs.aggregate([
    {
      $match: {
        $and: [
          { productCodes: { $in: productCodes } },
          {
            $or: [
              {
                endDate: { $exists: false },
                startDate: { $gte: startDate, $lt: endDate },
              },
              {
                $or: [
                  { startDate: { $gte: startDate, $lt: endDate } },
                  { 'endDate:': { $gte: startDate, $lt: endDate } },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      $group: {
        _id: '$supplierId',
        maxStartDate: { $max: '$startDate' },
      },
    },
  ]);

  let rowIndex = 3;

  sheet.cell(rowIndex++, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet.cell(rowIndex++, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet.cell(rowIndex++, 2).value(`Number of records: ${items.length}`);
  sheet
    .cell(rowIndex++, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);
  sheet.cell(rowIndex++, 2).value('Scheme: Supplier');
  sheet.cell(rowIndex++, 2).value(`Product code: ${productCodes.join()}`);

  rowIndex = 10;

  for (let item of items) {
    const supplier = await Companies.findOne({ _id: item._id });

    sheet.cell(rowIndex, 2).value(supplier.createdDate.toLocaleDateString('mn-MN'));
    sheet.cell(rowIndex, 3).value(supplier.createdDate.toLocaleTimeString('mn-MN'));
    sheet
      .cell(rowIndex, 4)
      .value(
        (supplier.contactInfo || { name: '' }).name
          ? ''
          : (supplier.basicInfo || { mnName: '' }).mnName,
      );

    rowIndex++;
  }

  // Write to file.
  return generateXlsx(workbook, 'suppliers_by_product_code_logs_export');
};
