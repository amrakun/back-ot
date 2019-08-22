import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { TenderMessages } from '../src/db/models';

dotenv.config();

/**
 * Tender messages remove invalid messages
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const validMessages = [
        '5d5e3d5181a4e84e2eabec90',
        '5d5e332b81a4e84e2eabea3e',
        '5d5e25a581a4e84e2eabe83a',
        '5d5e045b81a4e84e2eabd074',
        '5d5d0a0881a4e84e2eabca6c',
        '5d5cebae81a4e84e2eabc689',
        '5d5ceb5d81a4e84e2eabc683',
        '5d5bad3781a4e84e2eaba304',
      ];

      const tenderMessages = await TenderMessages.find({ tenderId: '5d5a5d3581a4e84e2eab789b' });

      for (const message of tenderMessages) {
        const replies = await TenderMessages.find({ replyToId: message._id });

        if (replies.length === 0 && !validMessages.includes(message._id.toString())) {
          await TenderMessages.remove({ _id: message._id });
        }
      }

      next();
    },
  );
};
