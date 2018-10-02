import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders, TenderResponses } from '../db/models';
import { decryptArray } from '../db/models/utils';

dotenv.config();

mongoose.Promise = global.Promise;

// Add plain fields
export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL);

  const tenders = await Tenders.find({});

  for (const tender of tenders) {
    const doc = {
      plainName: tender.name,
      plainNumber: tender.number,
      plainContent: tender.content,
    };

    // is encrypted tender
    if (typeof tender.__enc_name !== 'undefined') {
      // eslint-disable-line
      doc.plainSupplierIds = decryptArray(tender.supplierIds);
      doc.plainWinnerIds = decryptArray(tender.winnerIds);
    } else {
      doc.plainSupplierIds = tender.supplierIds;
      doc.plainWinnerIds = tender.winnerIds;
    }

    await Tenders.update({ _id: tender._id }, { $set: doc });
  }

  const responses = await TenderResponses.find({});

  for (const response of responses) {
    await TenderResponses.update(
      { _id: response._id },
      { $set: { plainSupplierId: response.supplierId } },
    );
  }

  mongoose.disconnect();
};

customCommand();
