import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { uniq, compact } from 'underscore';
import { Tenders, TenderResponses, Companies } from '../src/db/models';

dotenv.config();

const display = list => {
  return list.map(rp => {
    const item = { productId: rp.productId, code: rp.code };

    if (rp.unitPrice) {
      item.unitPrice = rp.unitPrice;
    }

    return item;
  });
};

const fixNeeded = (requestedProducts, respondedProducts) => {
  const uniqRespondedProducts = uniq(respondedProducts.map(rp => rp.code));

  if (respondedProducts.length === 0) {
    return false;
  }

  if (requestedProducts.length === respondedProducts.length) {
    return false;
  }

  if (compact(uniqRespondedProducts).length === 0) {
    return false;
  }

  return true;
};

mongoose.Promise = global.Promise;

module.exports.up = async next => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  const tenders = await Tenders.find({
    createdDate: { $gt: new Date('2019-10-01') },
    type: 'rfq',
    status: { $in: ['closed'] },
    rfqType: 'goods',
  });

  let totalCount = 0;
  let validCount = 0;
  let inValidCount = 0;
  let noFixNeededCount = 0;
  let fixableCount = 0;

  for (const tender of tenders) {
    totalCount++;

    const responses = await TenderResponses.find({
      tenderId: tender._id,
    });

    const requestedProducts = tender.requestedProducts || [];
    const uniqRequestedProducts = uniq(requestedProducts.map(rp => rp.code));

    if (responses.length === 0) {
      validCount++;
      continue;
    }

    inValidCount++;

    let status = 'noFixNeeded';

    for (const response of responses) {
      if (fixNeeded(requestedProducts, response.respondedProducts || [])) {
        status = 'fixNeeded';
        break;
      }
    }

    if (status === 'noFixNeeded') {
      noFixNeededCount++;
      continue;
    }

    // fixable ======
    if (uniqRequestedProducts.length === requestedProducts.length) {
      fixableCount++;

      console.log(tender.number);

      let totalRCount = 0;
      let fixNeededRCount = 0;

      for (const response of responses) {
        totalRCount++;

        const respondedProducts = response.respondedProducts || [];

        if (!fixNeeded(requestedProducts, respondedProducts)) {
          continue;
        }

        fixNeededRCount++;

        const fixedRespondedProducts = [];

        for (const respondedProduct of respondedProducts) {
          const requestedProduct = requestedProducts.find(rp => rp.code === respondedProduct.code);

          if (requestedProduct) {
            fixedRespondedProducts.push({
              ...respondedProduct.toObject(),
              productId: requestedProduct.productId,
            });
          }
        }

        const supplier = await Companies.findOne({ _id: response.supplierId });

        console.log('Total RES count:', totalRCount, '  Fix needed count:', fixNeededRCount);
        console.log('--------', supplier.basicInfo.enName);
        console.log(display(respondedProducts));
        console.log(fixedRespondedProducts);

        await TenderResponses.update(
          { _id: response._id },
          { $set: { respondedProducts: fixedRespondedProducts } },
        );
      }
    } else {
      console.log('Not fixable', tender.number);
    }
  }

  console.log(
    'Total count: ',
    totalCount,
    '\n',
    'Valid count: ',
    validCount,
    '\n',
    'Invalid count: ',
    inValidCount,
    '\n',
    'No fix needed count: ',
    noFixNeededCount,
    '\n',
    'Fixable count: ',
    fixableCount,
  );

  mongoose.connection.close();

  next();
};

module.exports.down = next => {
  next();
};
