import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders, TenderResponses } from '../db/models';
import { encryptArray } from '../db/models/utils';

dotenv.config();

mongoose.Promise = global.Promise;

// Encrypt using plain fields
export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL);

  const tenders = await Tenders.find({});

  for (const tender of tenders) {
    await Tenders.update(
      { _id: tender._id },
      {
        $set: {
          name: tender.plainName,
          number: tender.plainNumber,
          content: tender.plainContent,
          supplierIds: encryptArray(tender.plainSupplierIds),
          winnerIds: encryptArray(tender.plainWinnerIds),
        },
      },
    );

    await Tenders.update(
      { _id: tender._id },
      {
        $set: {
          plainName: undefined,
          plainNumber: undefined,
          plainContent: undefined,
          plainSupplierIds: undefined,
          plainWinnerIds: undefined,
        },
      },
    );
  }

  const responses = await TenderResponses.find({});

  for (const response of responses) {
    await TenderResponses.update(
      { _id: response._id },
      { $set: { supplierId: response.plainSupplierId } },
    );

    await TenderResponses.update({ _id: response._id }, { $set: { plainSupplierId: undefined } });
  }

  mongoose.disconnect();
};

customCommand();
