/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Configs, Users, Tenders } from '../db/models';
import {
  userFactory,
  configFactory,
  tenderFactory,
  tenderResponseFactory,
  companyFactory,
} from '../db/factories';

import tenderMutations from '../data/resolvers/mutations/tenders';
import tenderResponseMutations from '../data/resolvers/mutations/tenderResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
  let _tender;
  let _user;

  const commonParams = `
    $number: String!,
    $name: String!,
    $content: String!,
    $attachments: [JSON],
    $publishDate: Date!,
    $closeDate: Date!,
    $sourcingOfficer: String,
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
    attachments: $attachments,
    publishDate: $publishDate,
    closeDate: $closeDate,
    sourcingOfficer: $sourcingOfficer,
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

    await configFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Configs.remove({});
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

  test('Tenders supplier required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(1);

    const mutations = ['tenderResponsesSend'];

    const user = await userFactory({});

    for (let mutation of mutations) {
      checkLogin(tenderResponseMutations[mutation], { _id: _tender.id }, { user });
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
    delete _tender.winnerIds;
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
    delete restParams.winnerIds;
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
    const mutation = `
      mutation tendersAward($_id: String!, $supplierIds: [String!]!) {
        tendersAward(_id: $_id, supplierIds: $supplierIds) {
          winnerIds
        }
      }
    `;

    const supplier = await companyFactory({});

    await tenderResponseFactory({
      tenderId: _tender._id,
      supplierId: supplier._id,
    });

    const args = { _id: _tender._id.toString(), supplierIds: [supplier._id] };

    const response = await graphqlRequest(mutation, 'tendersAward', args);

    expect(response.winnerIds.length).toBe(1);
  });

  test('Send regret letter', async () => {
    const supplier = await companyFactory({});
    const supplierId = supplier._id;
    const tender = await Tenders.findOne({ _id: _tender._id });
    const tenderId = tender._id.toString();

    await tender.update({ winnerIds: [supplierId] });

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

  test('Cancel', async () => {
    const mutation = `
      mutation tendersCancel($_id: String!) {
        tendersCancel(_id: $_id) {
          status
        }
      }
    `;

    const args = { _id: _tender._id };

    const response = await graphqlRequest(mutation, 'tendersCancel', args);

    expect(response.status).toBe('canceled');
  });

  test('Send response', async () => {
    const company = await companyFactory();
    const tender = await tenderFactory({ status: 'open' });
    const user = await userFactory({ isSupplier: true });

    await tenderResponseFactory({ supplierId: company._id, tenderId: tender._id });

    const mutation = `
      mutation tenderResponsesSend($tenderId: String!, $supplierId: String!) {
        tenderResponsesSend(tenderId: $tenderId, supplierId: $supplierId) {
          _id
          isSent
        }
      }
    `;

    const response = await graphqlRequest(
      mutation,
      'tenderResponsesSend',
      { supplierId: company._id, tenderId: tender._id },
      { user },
    );

    expect(response.isSent).toBe(true);
  });
});
