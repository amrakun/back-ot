/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tenders, TenderResponses, Users, Companies } from '../db/models';
import { userFactory, tenderFactory, companyFactory } from '../db/factories';
import tenderResponseMutations from '../data/resolvers/mutations/tenderResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
  let _user;
  let _tender;
  let _company;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _tender = await tenderFactory();
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Tenders.remove({});
    await TenderResponses.remove({});
    await Companies.remove({});
  });

  test('TenderResponses login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(1);

    // add tender
    checkLogin(tenderResponseMutations.tenderResponsesAdd, {
      tenderId: _tender._id,
      supplierId: _company._id,
    });
  });

  test('Create tender response', async () => {
    TenderResponses.create = jest.fn();

    const _doc = { tenderId: _tender._id, supplierId: _company._id };

    await tenderResponseMutations.tenderResponsesAdd({}, _doc, { user: _user });

    expect(TenderResponses.create.mock.calls.length).toBe(1);
    expect(TenderResponses.create).toBeCalledWith(_doc);
  });
});
