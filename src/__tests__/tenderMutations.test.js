/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Tenders } from '../db/models';
import { tenderFactory, companyFactory } from '../db/factories';
import tenderMutations from '../data/resolvers/mutations/tenders';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
  let _tender;

  const commonParams = `
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
  `;

  const commonValues = `
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
  `;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
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
    const supplier = await companyFactory();

    Tenders.createTender = jest.fn(() => ({ _id: 'DFAFSFASDF', supplierIds: [supplier._id] }));

    const mutation = `
      mutation tendersAdd($type: String!  ${commonParams}) {
        tendersAdd(type: $type, ${commonValues}) {
          _id
        }
      }
    `;

    delete _tender._id;
    await graphqlRequest(mutation, 'tendersAdd', _tender);

    expect(Tenders.createTender.mock.calls.length).toBe(1);

    _tender.publishDate = new Date(_tender.publishDate);
    _tender.closeDate = new Date(_tender.closeDate);

    expect(Tenders.createTender).toBeCalledWith(_tender);
  });

  test('Update tender', async () => {
    Tenders.updateTender = jest.fn(() => _tender);

    const mutation = `
      mutation tendersEdit($_id: String!  ${commonParams}) {
        tendersEdit(_id: $_id, ${commonValues}) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'tendersEdit', _tender);

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
      mutation tendersAward($_id: String!, $supplierId: String!) {
        tendersAward(_id: $_id, supplierId: $supplierId) {
          winnerId
        }
      }
    `;

    const args = { _id: _tender._id.toString(), supplierId: 'DFDAFFDSAFSDF' };

    await graphqlRequest(mutation, 'tendersAward', args);

    expect(Tenders.award.mock.calls.length).toBe(1);
    expect(Tenders.award).toBeCalledWith(args._id, args.supplierId);
  });
});
