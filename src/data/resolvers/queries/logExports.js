import { readTemplate, generateXlsx } from '../../utils';
import { TenderResponseLogs, Users, Companies, SearchLogs, Tenders } from '../../../db/models';

/**
 * Export tenders
 * @param [Object] tenders - Filtered tenders
 * @return {String} - file url
 */
export const userLogins = async ({ startDate, endDate }, user) => {
  // supplier logins by rfq submissions
  let items = await TenderResponseLogs.find({
    tenderType: 'rfq',
    createdDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  const { workbook } = await readTemplate('user_last_logins');
  const sheet2 = workbook.sheet(2);

  sheet2.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet2.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet2.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet2
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  let rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item.userId });
    const company = await Companies.findOne({ _id: user.companyId });

    sheet2.cell(rowIndex, 2).value(company.basic.sapNumber);
    sheet2.cell(rowIndex, 3).value(company.contact.name);
    sheet2.cell(rowIndex, 4).value(user.username);
    sheet2.cell(rowIndex, 5).value(user.email);
    sheet2.cell(rowIndex, 6).value(item.createDate.toLocaleDateString());
    sheet2.cell(rowIndex, 7).value(item.createDate.toLocaleTimeString('mn-MN'));
  }

  // supplier logins by eoi submissions
  items = await TenderResponseLogs.find({
    tenderType: 'eoi',
    createdDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  const sheet3 = workbook.sheet(3);

  sheet3.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet3.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet3.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet3
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item.userId });
    const company = await Companies.findOne({ _id: user.companyId });

    sheet3.cell(rowIndex, 2).value(company.basic.sapNumber);
    sheet3.cell(rowIndex, 3).value(company.contact.name);
    sheet3.cell(rowIndex, 4).value(user.username);
    sheet3.cell(rowIndex, 5).value(user.email);
    sheet3.cell(rowIndex, 6).value(item.createDate.toLocaleDateString());
    sheet3.cell(rowIndex, 7).value(item.createDate.toLocaleTimeString('mn-MN'));
  }

  // supplier logins
  items = await Users.aggregate([
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

  const sheet0 = workbook.sheet(0);

  sheet0.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet0.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet0.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet0
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  for (let item of items) {
    const user = await Users.findOne({ _id: item._id });
    const company = await Companies.findOne({ _id: user.companyId });

    if (company) {
      sheet0.cell(rowIndex, 2).value(company.basic.sapNumber);
      sheet0.cell(rowIndex, 3).value(company.contact.name);
    }
    sheet0.cell(rowIndex, 4).value(user.username);
    sheet0.cell(rowIndex, 5).value(user.email);
    sheet0.cell(rowIndex, 6).value(item.lastLoginDate.toLocaleDateString());
    sheet0.cell(rowIndex, 7).value(item.lastLoginDate.toLocaleTimeString('mn-MN'));
  }

  // buyer logins
  items = await Users.aggregate([
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

  const sheet1 = workbook.sheet(1);

  sheet1.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet1.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet1.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet1
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  for (let item of items) {
    const user = await Users.findOne({ _id: item._id });
    sheet1.cell(rowIndex, 2).value(user.username);
    sheet1.cell(rowIndex, 3).value(user.email);
    sheet1.cell(rowIndex, 4).value(item.lastLoginDate.toLocaleDateString());
    sheet1.cell(rowIndex, 5).value(item.lastLoginDate.toLocaleTimeString('mn-MN'));
  }

  // Write to file.
  return generateXlsx(workbook, 'user_last_logins');
};

/**
 * Export tenders
 * @return {String} - file url
 */
export const activitiesPerBuyer = async ({ startDate, endDate }, user) => {
  // Searches per buyer (search logs)
  const items = await SearchLogs.find({
    createdDate: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  const { workbook } = await readTemplate('activities_per_buyer');

  const sheet0 = workbook.sheet(0);

  sheet0.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet0.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet0.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet0
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  let rowIndex = 9;

  for (let item of items) {
    const user = await Users.findOne({ _id: item.userId });

    sheet0.cell(rowIndex, 2).value(user.username);
    sheet0.cell(rowIndex, 3).value(user.email);
    sheet0.cell(rowIndex, 4).value(item.numberOfSearches);
  }

  // EOI created and sent
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
        _id: {
          createdUserId: '$createdUserId',
        },
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
        _id: {
          createdUserId: '$createdUserId',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const sheet1 = workbook.sheet(1);

  sheet1.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet1.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet1.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet1
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of groupedItemsAllCount) {
    const user = await Users.findOne({ _id: item._id });

    sheet1.cell(rowIndex, 2).value(user.username);
    sheet1.cell(rowIndex, 3).value(user.email);
    sheet1.cell(rowIndex, 4).value(item.count);

    let publishedCount = 0;
    for (let publishedCountItem of groupedItemsPublishedCount) {
      if (publishedCountItem._id == item._id) {
        publishedCount = publishedCountItem.count;
        break;
      }
    }
    sheet1.cell(rowIndex, 5).value(publishedCount);
  }

  // RFQ created and sent
  groupedItemsAllCount = await Tenders.aggregate([
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
        _id: {
          createdUserId: '$createdUserId',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  groupedItemsPublishedCount = await Tenders.aggregate([
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
        _id: {
          createdUserId: '$createdUserId',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const sheet2 = workbook.sheet(2);

  sheet2.cell(3, 2).value(`Produced by: ${user.firstName} ${user.lastName}`);
  sheet2.cell(4, 2).value(`Date and Time Run: ${new Date().toLocaleString()}`);
  sheet2.cell(5, 2).value(`Number of records: ${items.length}`);
  sheet2
    .cell(6, 2)
    .value(`Date range: ${startDate.toLocaleDateString()} :  ${endDate.toLocaleDateString()}`);

  rowIndex = 9;

  for (let item of groupedItemsAllCount) {
    const user = await Users.findOne({ _id: item._id });

    sheet2.cell(rowIndex, 2).value(user.username);
    sheet2.cell(rowIndex, 3).value(user.email);
    sheet2.cell(rowIndex, 4).value(item.count);

    let publishedCount = 0;
    for (let publishedCountItem of groupedItemsPublishedCount) {
      if (publishedCountItem._id == item._id) {
        publishedCount = publishedCountItem.count;
        break;
      }
    }
    sheet2.cell(rowIndex, 5).value(publishedCount);
  }

  // Write to file.
  return generateXlsx(workbook, 'activities_per_buyer');
};
