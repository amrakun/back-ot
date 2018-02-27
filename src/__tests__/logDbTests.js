/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { SearchLogs, Tenders } from '../db/models';
import { userFactory, tenderFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Log tests', () => {
  let _user;
  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {});

  test('SearchLog', async () => {
    const searchLog = await SearchLogs.createLog(_user._id);
    expect(searchLog.numberOfSearches).toBe(1);
    const searchLog2 = await SearchLogs.createLog(_user._id);
    expect(searchLog2.numberOfSearches).toBe(2);
  });

  test('eoiCreatedAndSent', async () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    await tenderFactory({ type: 'eoi', createdUserId: 'aa' });
    await tenderFactory({ type: 'eoi', createdUserId: 'aa' });
    await tenderFactory({ type: 'eoi', createdUserId: 'aa' });
    await tenderFactory({ type: 'eoi', createdUserId: 'bb' });
    await tenderFactory({ type: 'eoi', createdUserId: 'bb' });
    await tenderFactory({ type: 'eoi', createdUserId: 'cc' });
    await tenderFactory({ type: 'eoi', createdUserId: 'cc' });

    const draftTenders = await Tenders.aggregate([
      {
        $match: {
          type: 'eoi',
          createdDate: {
            $gte: todayStart,
            $lt: todayEnd,
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

    const eoiPublishTenders = await Tenders.aggregate([
      {
        $match: {
          type: 'eoi',
          createdDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
          publishDate: {
            $lt: todayEnd,
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

    // const eoiDraftTenders = await Tenders.aggregate([
    //   {
    //     $match: {
    //       type: 'rfq',
    //       createdDate: {
    //         $gte: todayStart,
    //         $lt: todayEnd,
    //       }
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: {
    //         createdUserId: '$createdUserId',
    //       },
    //       count: {$sum: 1}
    //     }
    //   }
    // ]);

    // const eoiPublishTenders = await Tenders.aggregate([
    //   {
    //     $match: {
    //       type: 'rfq',
    //       createdDate: {
    //         $gte: todayStart,
    //         $lt: todayEnd,
    //       },
    //       publishDate: {
    //         $lt: todayEnd,
    //       }
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: {
    //         createdUserId: '$createdUserId',
    //       },
    //       count: {$sum: 1}
    //     }
    //   }
    // ]);

    console.log('eoiPublishTenders: ', eoiPublishTenders);
  });
});
