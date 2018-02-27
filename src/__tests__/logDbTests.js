/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { SearchLogs, TenderResponseLogs, Tenders, Users } from '../db/models';
import { userFactory, tenderFactory, tenderResponseFactory } from '../db/factories';

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

    const eoiDraftTenders = await Tenders.aggregate([
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
          _id: '$createdUserId',
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
          _id: '$createdUserId',

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

    await Users.login({ email: _user.email, password: 'pass' });

    const supplierLastLogin = await Users.aggregate([
      {
        $match: {
          isSupplier: true,
          lastLoginDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: { username: '$username', email: '$email' },
          lastLoginDate: { $max: '$lastLoginDate' },
        },
      },
    ]);

    const buyerLastLogin = await Users.aggregate([
      {
        $match: {
          isSupplier: { $ne: true },
          lastLoginDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: { username: '$username', email: '$email' },
          lastLoginDate: { $max: '$lastLoginDate' },
        },
      },
    ]);

    const tenderEoiA = await tenderFactory({ type: 'eoi' });
    const tenderEoiB = await tenderFactory({ type: 'eoi' });
    const tenderEoiC = await tenderFactory({ type: 'eoi' });
    const tenderRfqA = await tenderFactory({ type: 'rfq' });
    const tenderRfqB = await tenderFactory({ type: 'rfq' });

    const tenderResponseA = await tenderResponseFactory({ tenderId: tenderEoiA._id });
    const tenderResponseB = await tenderResponseFactory({ tenderId: tenderEoiB._id });
    const tenderResponseC = await tenderResponseFactory({ tenderId: tenderEoiC._id });
    const tenderResponseD = await tenderResponseFactory({ tenderId: tenderRfqA._id });
    const tenderResponseE = await tenderResponseFactory({ tenderId: tenderRfqB._id });

    const _user2 = await userFactory({});

    await TenderResponseLogs.createLog(tenderResponseA, _user._id);
    await TenderResponseLogs.createLog(tenderResponseB, _user._id);
    await TenderResponseLogs.createLog(tenderResponseC, _user2._id);
    await TenderResponseLogs.createLog(tenderResponseD, _user._id);
    await TenderResponseLogs.createLog(tenderResponseE, _user2._id);

    const tenderResponseLogs = await TenderResponseLogs.find({});
  });
});
