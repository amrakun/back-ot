/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import sinon from 'sinon';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Configs, Users, Tenders } from '../db/models';
import {
  userFactory,
  configFactory,
  tenderDoc,
  tenderFactory,
  tenderResponseFactory,
  companyFactory,
} from '../db/factories';

import tenderMutations from '../data/resolvers/mutations/tenders';
import tenderResponseMutations from '../data/resolvers/mutations/tenderResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
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
    const tender = await tenderFactory();

    for (let mutation of mutations) {
      checkLogin(tenderMutations[mutation], { _id: tender.id }, { user });
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

    const tender = await tenderFactory();
    const user = await userFactory({});

    for (let mutation of mutations) {
      checkLogin(tenderResponseMutations[mutation], { _id: tender.id }, { user });
    }
  });

  test('Create tender', async () => {
    const mock = sinon.stub(Tenders, 'createTender').callsFake(() => ({ _id: Math.random() }));

    const mutation = `
      mutation tendersAdd($type: String!  ${commonParams}) {
        tendersAdd(type: $type, ${commonValues}) {
          _id
        }
      }
    `;

    const doc = await tenderDoc({ type: 'rfq' });

    await graphqlRequest(mutation, 'tendersAdd', doc, { user: _user });

    expect(mock.called).toBe(true);
    expect(mock.calledWith(doc, _user._id)).toBe(true);

    mock.restore();
  });

  test('Update tender', async () => {
    const mock = sinon.stub(Tenders, 'updateTender').callsFake(() => ({ _id: Math.random() }));

    const mutation = `
      mutation tendersEdit($_id: String!  ${commonParams}) {
        tendersEdit(_id: $_id, ${commonValues}) {
          _id
        }
      }
    `;

    const tender = await tenderFactory();
    const tenderId = tender._id.toString();
    const doc = await tenderDoc();
    const args = { _id: tenderId, ...doc };

    await graphqlRequest(mutation, 'tendersEdit', args);

    expect(mock.calledOnce).toBe(true);
    expect(mock.calledWith(tenderId, doc)).toBe(true);

    mock.restore();
  });

  test('Delete tender', async () => {
    const mock = sinon.stub(Tenders, 'removeTender').callsFake(() => ({ _id: Math.random() }));

    const mutation = `
      mutation tendersRemove($_id: String!) {
        tendersRemove(_id: $_id)
      }
    `;

    const tender = await tenderFactory();
    const tenderId = tender._id.toString();

    await graphqlRequest(mutation, 'tendersRemove', { _id: tenderId });

    expect(mock.calledOnce).toBe(true);
    expect(mock.calledWith(tenderId)).toBe(true);

    mock.restore();
  });

  test('Award', async () => {
    const mutation = `
      mutation tendersAward($_id: String!, $supplierIds: [String!]!) {
        tendersAward(_id: $_id, supplierIds: $supplierIds) {
          winnerIds
        }
      }
    `;

    const tender = await tenderFactory({ status: 'open' });
    const supplier = await companyFactory({});

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier._id,
    });

    const args = { _id: tender._id.toString(), supplierIds: [supplier._id] };

    const response = await graphqlRequest(mutation, 'tendersAward', args);

    expect(response.winnerIds.length).toBe(1);
  });

  test('Send regret letter', async () => {
    const supplier = await companyFactory({});
    const supplierId = supplier._id;
    const tender = await tenderFactory({ status: 'open' });
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

    const tender = await tenderFactory();
    const args = { _id: tender._id };

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
