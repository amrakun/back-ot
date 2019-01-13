import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Tenders, TenderResponses } from '../src/db/models';

dotenv.config();

/**
 * Added rfqType field
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      await Tenders.update({ type: 'rfq' }, { $set: { rfqType: 'goods' } }, { multi: true });

      const trfqs = await Tenders.find({ type: 'trfq' });
      const tenderIds = trfqs.map(tender => tender._id.toString());
      const responses = await TenderResponses.find({ tenderId: { $in: tenderIds } });

      for (const response of responses) {
        await TenderResponses.update(
          { _id: response._id },
          { $set: { respondedFiles: response.respondedServiceFiles } },
        );
      }

      next();
    },
  );
};
