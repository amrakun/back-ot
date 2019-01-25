/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderLog } from '../db/models';
import { userFactory, tenderFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('TenderLog db', () => {
  let _tender;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
    await Users.remove({});
    await TenderLog.remove({});
  });

  test('Can write', async () => {
    TenderLog.write({
      tenderId: _tender._id.toString(),
      userId: _user._id.toString(),
      action: 'cancel',
      description: undefined,
    });
  });
});
