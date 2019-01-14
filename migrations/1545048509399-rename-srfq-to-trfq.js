import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Tenders, Configs } from '../src/db/models';

dotenv.config();

/**
 * Rename srfq to trfq
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      await Tenders.update({ type: 'srfq' }, { $set: { type: 'trfq' } }, { multi: true });

      const config = await Configs.findOne({});

      if (config) {
        await Configs.update({}, { $set: { trfqTemplates: config.srfqTemplates } });
      }

      next();
    },
  );
};
