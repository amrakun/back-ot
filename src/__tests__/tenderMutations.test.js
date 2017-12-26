/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
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

    expect.assertions(4);

    // add tender
    checkLogin(tenderMutations.tendersAdd, {
      name: _tender.name,
      content: _tender.content,
    });

    // update tender
    checkLogin(tenderMutations.tendersEdit, { _id: _tender.id });

    // remove tender
    checkLogin(tenderMutations.tendersRemove, { _id: _tender.id });

    // award tender
    checkLogin(tenderMutations.tendersAward, { _id: _tender.id });
  });

  test('Create tender', async () => {
    Tenders.create = jest.fn();

    const _doc = { name: _tender.name, content: _tender.content };

    await tenderMutations.tendersAdd({}, _doc, { user: _user });

    expect(Tenders.create.mock.calls.length).toBe(1);
    expect(Tenders.create).toBeCalledWith(_doc);
  });

  test('Update tender', async () => {
    Tenders.updateTender = jest.fn(() => _tender);

    const mutation = `
      mutation tendersEdit(
        $_id: String!
        $number: Float!,
        $name: String!,
        $content: String!,
        $publishDate: Date!,
        $closeDate: Date!,
        $file: JSON!,
        $reminderDay: Float!,
        $supplierIds: [String]!,
        $requestedProducts: [TenderRequestedProductInput]
        $requestedDocuments: [String]
      ) {
        tendersEdit(
          _id: $_id
          number: $number,
          name: $name,
          content: $content,
          publishDate: $publishDate,
          closeDate: $closeDate,
          file: $file,
          reminderDay: $reminderDay,
          supplierIds: $supplierIds,
          requestedProducts: $requestedProducts,
          requestedDocuments: $requestedDocuments
        ) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'updateTender', _tender);

    expect(Tenders.updateTender.mock.calls.length).toBe(1);

    const { _id, ...restParams } = _tender;

    delete restParams.type;
    restParams.publishDate = new Date(restParams.publishDate);
    restParams.closeDate = new Date(restParams.closeDate);

    expect(Tenders.updateTender).toBeCalledWith(_id, restParams);
  });

  test('Delete tender', async () => {
    Tenders.removeTender = jest.fn(() => ({}));

    const mutation = `
      mutation tendersRemove($_id: String!) {
        tendersRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'tendersRemove', { _id: _tender._id });

    expect(Tenders.removeTender.mock.calls.length).toBe(1);
    expect(Tenders.removeTender).toBeCalledWith(_tender._id);
  });

  test('Award', async () => {
    Tenders.award = jest.fn(() => ({}));

    const mutation = `
      mutation tendersAward($_id: String!, $responseId: String!) {
        tendersAward(_id: $_id, responseId: $responseId) {
          winnerId
        }
      }
    `;

    const args = { _id: _tender._id.toString(), responseId: 'DFDAFFDSAFSDF' };

    await graphqlRequest(mutation, 'tendersAward', args);

    expect(Tenders.award.mock.calls.length).toBe(1);
    expect(Tenders.award).toBeCalledWith(args._id, args.responseId);
  });
});
