/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Tenders } from '../db/models';
import { userFactory, tenderFactory, tenderResponseFactory, companyFactory } from '../db/factories';

import tenderMutations from '../data/resolvers/mutations/tenders';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
  let _tender;
  let _user;

  const commonParams = `
    $number: String!,
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
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
    await Users.remove({});
  });

  test('Tenders buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(5);

    const mutations = [
      'tendersAdd',
      'tendersEdit',
      'tendersRemove',
      'tendersAward',
      'tendersSendRegretLetter',
    ];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(tenderMutations[mutation], { _id: _tender.id }, { user });
    }
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
    delete _tender.status;
    delete _tender.createdDate;
    delete _tender.createdUserId;
    delete _tender.sentRegretLetter;
    await graphqlRequest(mutation, 'tendersAdd', _tender, { user: _user });

    expect(Tenders.createTender.mock.calls.length).toBe(1);

    _tender.publishDate = new Date(_tender.publishDate);
    _tender.closeDate = new Date(_tender.closeDate);

    expect(Tenders.createTender).toBeCalledWith(_tender, _user._id);
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
    delete restParams.status;
    delete restParams.createdDate;
    delete restParams.createdUserId;
    delete restParams.sentRegretLetter;
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

  test('Send regret letter', async () => {
    const supplier = await companyFactory({});
    const supplierId = supplier._id;
    const tender = await Tenders.findOne({ _id: _tender._id });
    const tenderId = tender._id.toString();

    await tender.update({ winnerId: supplierId });

    await tenderResponseFactory({ tenderId, supplierId });
    const notAwarded1 = await tenderResponseFactory({ tenderId });
    const notAwarded2 = await tenderResponseFactory({ tenderId });

    const mutation = `
      mutation tendersSendRegretLetter($_id: String!, $subject: String!, $content: String!) {
        tendersSendRegretLetter(_id: $_id, subject: $subject, content: $content)
      }
    `;

    const args = { _id: tenderId, subject: 'subject', content: 'content' };

    const response = await graphqlRequest(mutation, 'tendersSendRegretLetter', args);

    const updatedTender = await Tenders.findOne({ _id: tenderId });

    expect(response).toContain(notAwarded1.supplierId);
    expect(response).toContain(notAwarded2.supplierId);
    expect(updatedTender.sentRegretLetter).toBe(true);
  });
});
