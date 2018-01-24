/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import queries from '../data/resolvers/queries/reports';
import { userFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('report query permission checks', () => {
  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(3);

    const user = await userFactory({ isSupplier: true });

    for (let query of ['reportsSuppliersExport', 'reportsTendersExport', 'reportsAuditExport']) {
      checkLogin(queries[query], {}, { user });
    }
  });
});
