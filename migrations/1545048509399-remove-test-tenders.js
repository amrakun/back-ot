import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Tenders } from '../src/db/models';

dotenv.config();

/**
 * Add isActive field on user
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    async () => {
      const _ids = [
          // rfqs
          '5c47feca63ba980fc10e460c',
          '5c40437798d2000cde211906',
          '5c11f43e98c264631d7b2696',
          '5c11f35398c264631d7b2685',
          '5c107a5798c264631d7b20a0',
          '5bdfc3ffb787da63686c6058',
          '5bdfc09cb787da63686c5fd8',
          '5bdfc08db787da63686c5fd5',
          '5bdfc002b787da63686c5fcb',
          '5bdfbfd6b787da63686c5fc7',
          '5bdfbfd0b787da63686c5fc5',
          '5bdfbfb2b787da63686c5fc1',
          '5bdfbf6bb787da63686c5fb4',
          '5bdfbf4cb787da63686c5fac',
          '5bdfbea0b787da63686c5f79',
          '5bdfbe4db787da63686c5f67',
          '5bb1d1d97c0c7724889ef55d',
          '5bad9d2c4658890bc60d1f1e',
          '5bad9b174658890bc60d1ef9',
          '5bad99054658890bc60d1ed2',
          '5bad98d54658890bc60d1ecc',
          '5bac3e8f4658890bc60d19ff',
          '5bdfa133b787da63686c5dcc',
          '5bb190e04658890bc60d2218',
          '5bd8f10a6e4fa4153b8cc885',
          '5bc8382ab8e4d45451f3991c',
          '5bc6d6ded12d0062f644ce6e',
          '5bc6d617d12d0062f644ce4f',
          '5bc6d431d12d0062f644cdda',
          '5bc6b3fed12d0062f644cbe6',
          '5bb1d1657c0c7724889ef558',
          '5bb194c04658890bc60d2230',
          '5bb18e034658890bc60d2202',
          '5ba9f56e4658890bc60d1678',

          // eois
          '5c36c63482343e4aa33e1184',
          '5c36b76e82343e4aa33e10d9',
          '5c36acd582343e4aa33e106a',
          '5c340d0e3cb2211d0962d247',
          '5c3408143cb2211d0962d216',
          '5bf4b5866969b5519ea5aa93',
          '5bdfa307b787da63686c5dd2',
          '5bc82c06b8e4d45451f398f2',
          '5bad932a4658890bc60d1e83',
          '5bdfc3abb787da63686c6040',
          '5bdfbc9cb787da63686c5f48',
          '5bdfbb92b787da63686c5f37',
          '5bdfbb64b787da63686c5f2e',
          '5bdfbb5fb787da63686c5f26',
          '5bc82c50b8e4d45451f398f9',
          '5bdfbb90b787da63686c5f35',
          '5bdfbb8bb787da63686c5f33',
          '5bdfbb63b787da63686c5f2c',
          '5bdfbb63b787da63686c5f2a',
          '5bdfbb62b787da63686c5f28',
          '5bb1d61b7c0c7724889ef572',
          '5bb18c644658890bc60d21f5',
          '5bad930f4658890bc60d1e7f',
          '5bad90ae4658890bc60d1e72',
          '5bad90934658890bc60d1e6e',
          '5bad8f174658890bc60d1e63',
          '5bad8e894658890bc60d1e5d',
          '5ba9ef784658890bc60d1652',
          '5ba9ec984658890bc60d1640',
          '5ba9eb444658890bc60d1639',
          '5ba4a2a54658890bc60d1349',
          '5ba49f734658890bc60d1339',
          '5ba49d7c4658890bc60d131c',
          '5b9f2ac5e84b2e137147f29e',
      ];

      await Tenders.update({ _id: { $in: _ids }}, { $set: { isDeleted: true } }, { multi: true });

      next();
    },
  );
};
