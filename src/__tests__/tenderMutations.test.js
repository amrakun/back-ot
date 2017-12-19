/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tenders, Users } from '../db/models';
import { tenderFactory, userFactory } from '../db/factories';
import tenderMutations from '../data/resolvers/mutations/tenders';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
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
  });

  test('Tenders login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(3);

    // add tender
    checkLogin(tenderMutations.tendersAdd, {
      name: _tender.name,
      content: _tender.content,
    });

    // update tender
    checkLogin(tenderMutations.tendersEdit, { _id: _tender.id });

    // remove tender
    checkLogin(tenderMutations.tendersRemove, { _id: _tender.id });
  });

  test('Create tender', async () => {
    Tenders.create = jest.fn();

    const _doc = { name: _tender.name, content: _tender.content };

    await tenderMutations.tendersAdd({}, _doc, { user: _user });

    expect(Tenders.create.mock.calls.length).toBe(1);
    expect(Tenders.create).toBeCalledWith(_doc);
  });

  test('Update tender', async () => {
    Tenders.updateTender = jest.fn();

    const _doc = { name: _tender.name, content: _tender.content };

    await tenderMutations.tendersEdit({}, { _id: _tender.id, ..._doc }, { user: _user });

    expect(Tenders.updateTender.mock.calls.length).toBe(1);
    expect(Tenders.updateTender).toBeCalledWith(_tender.id, _doc);
  });

  test('Delete tender', async () => {
    Tenders.removeTender = jest.fn();

    await tenderMutations.tendersRemove({}, { _id: _tender.id }, { user: _user });

    expect(Tenders.removeTender.mock.calls.length).toBe(1);
    expect(Tenders.removeTender).toBeCalledWith(_tender.id);
  });
});
