/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import sinon from 'sinon';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Configs, Users, Tenders, Companies } from '../db/models';
import { encryptArray } from '../db/models/utils';
import {
  userFactory,
  configFactory,
  tenderDoc,
  tenderFactory,
  tenderResponseFactory,
  companyFactory,
} from '../db/factories';

import tenderUtils from '../data/tenderUtils';
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
    $supplierIds: [String],
    $isToAll: Boolean,
    $tierTypes: [String]
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
    isToAll: $isToAll,
    tierTypes: $tierTypes,
    requestedProducts: $requestedProducts,
    requestedDocuments: $requestedDocuments
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    await tenderFactory({});

    await configFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Configs.remove({});
    await Tenders.remove({});
    await Users.remove({});
    await Companies.remove({});
  });

  test('Tenders buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(4);

    const mutations = ['tendersAdd', 'tendersEdit', 'tendersAward', 'tendersSendRegretLetter'];

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
    const mock = sinon.stub(tenderUtils, 'sendEmailToSuppliers').callsFake(() => 'sent');

    const mutation = `
      mutation tendersAdd($type: String!, $rfqType: String ${commonParams}) {
        tendersAdd(type: $type, rfqType: $rfqType, ${commonValues}) {
          _id
        }
      }
    `;

    const doc = await tenderDoc({ type: 'rfq' });

    const tender = await graphqlRequest(mutation, 'tendersAdd', doc, { user: _user });

    expect(tender._id).toBeDefined();

    mock.restore();
  });

  const editTenderMutation = `
    mutation tendersEdit($_id: String!  ${commonParams}) {
      tendersEdit(_id: $_id, ${commonValues}) {
        _id
      }
    }
  `;

  test('Update tender: supplierIds are specified', async () => {
    const mock = sinon.stub(tenderUtils, 'sendEmailToSuppliers').callsFake(() => 'sent');

    expect(await Companies.find().count()).toBe(2);

    const [company1, company2] = await Companies.find({});

    const commonDoc = {
      status: 'open',
      isToAll: true,
      supplierIds: [company1._id.toString(), company2._id.toString()],
      createdUserId: _user._id,
      publishDate: new Date(),
    };

    // at this point we had 2 suppliers
    const tender = await tenderFactory(commonDoc);

    // new company registered after above tender's publish
    const company3 = await companyFactory({});

    const tenderId = tender._id.toString();
    const doc = await tenderDoc({ ...commonDoc, content: 'updated content' });
    const args = { _id: tenderId, ...doc };

    await graphqlRequest(editTenderMutation, 'tendersEdit', args, { user: _user });

    expect(mock.calledTwice).toBe(true);

    const [firstCallArgs] = mock.firstCall.args;
    expect(firstCallArgs.kind).toBe('supplier__publish');
    expect(firstCallArgs.supplierIds).toEqual([company3._id.toString()]);

    const [secondCallArgs] = mock.secondCall.args;
    expect(secondCallArgs.kind).toBe('supplier__edit');
    expect(secondCallArgs.supplierIds).toEqual([company1._id.toString(), company2._id.toString()]);

    mock.restore();
  });

  test('Update tender: isToAll is true', async () => {
    const mock = sinon.stub(tenderUtils, 'sendEmailToSuppliers').callsFake(() => 'sent');

    expect(await Companies.find().count()).toBe(2);

    const [company1, company2] = await Companies.find({});

    const commonDoc = {
      status: 'open',
      isToAll: true,
      supplierIds: [],
      createdUserId: _user._id,
      publishDate: new Date(),
    };

    // at this point we had 2 suppliers
    const tender = await tenderFactory(commonDoc);

    // new company registered after above tender's publish
    const company3 = await companyFactory({});

    const tenderId = tender._id.toString();
    const doc = await tenderDoc({ ...commonDoc, content: 'updated content' });
    const args = { _id: tenderId, ...doc };

    await graphqlRequest(editTenderMutation, 'tendersEdit', args, { user: _user });

    expect(mock.calledTwice).toBe(true);

    const [firstCallArgs] = mock.firstCall.args;
    expect(firstCallArgs.kind).toBe('supplier__publish');
    expect(firstCallArgs.supplierIds).toEqual([company3._id.toString()]);

    const [secondCallArgs] = mock.secondCall.args;
    expect(secondCallArgs.kind).toBe('supplier__edit');
    expect(secondCallArgs.supplierIds).toEqual([company1._id.toString(), company2._id.toString()]);

    mock.restore();
  });

  test('Update tender: specified tierTypes & with closed status', async () => {
    let mock = sinon.stub(tenderUtils, 'sendEmailToSuppliers').callsFake(() => 'sent');

    await Companies.remove({});

    const company1 = await companyFactory({ tierType: 'tier1' });
    const company2 = await companyFactory({ tierType: 'tier2' });

    const commonDoc = {
      status: 'open',
      tierTypes: ['tier1', 'tier2'],
      createdUserId: _user._id,
      publishDate: new Date(),
    };

    // at this point we had 2 suppliers
    const tender = await tenderFactory({ ...commonDoc, status: 'closed' });

    // new company registered after above tender's publish
    const company3 = await companyFactory({ tierType: 'tier1' });

    const tenderId = tender._id.toString();
    const doc = await tenderDoc({ ...commonDoc, content: 'updated content' });
    const args = { _id: tenderId, ...doc };

    await graphqlRequest(editTenderMutation, 'tendersEdit', args, { user: _user });

    expect(mock.calledOnce).toBe(true);

    let [firstCallArgs] = mock.firstCall.args;
    expect(firstCallArgs.kind).toBe('supplier__reopen');
    expect(firstCallArgs.supplierIds).toEqual([company1._id.toString(), company2._id.toString()]);
    mock.restore();

    // second edit ==============
    await Tenders.update({ _id: tender._id }, { $set: { status: 'closed' } });
    const secondMock = sinon.stub(tenderUtils, 'sendEmailToSuppliers').callsFake(() => 'sent');
    await graphqlRequest(editTenderMutation, 'tendersEdit', args, { user: _user });

    expect(secondMock.calledOnce).toBe(true);

    [firstCallArgs] = secondMock.firstCall.args;
    expect(firstCallArgs.kind).toBe('supplier__reopen');
    expect(firstCallArgs.supplierIds).toEqual([
      company1._id.toString(),
      company2._id.toString(),
      company3._id.toString(),
    ]);

    secondMock.restore();
  });

  test('Award', async () => {
    const mock = sinon.stub(tenderUtils, 'sendEmailToSuppliers').callsFake(() => 'sent');

    const mutation = `
      mutation tendersAward($_id: String!, $supplierIds: [String!]!, $note: String, $attachments: [TenderAwardAttachment]) {
        tendersAward(_id: $_id, supplierIds: $supplierIds, note: $note, attachments: $attachments) {
          winnerIds
          awardNote
        }
      }
    `;

    const tender = await tenderFactory({ status: 'open', createdUserId: _user._id, isToAll: true });
    const supplier = await companyFactory({});

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier._id,
    });

    const args = {
      _id: tender._id.toString(),
      supplierIds: [supplier._id],
      note: 'note',
      attachments: [
        {
          supplierId: supplier._id,
          attachment: { name: 'name', url: '/url' },
        },
      ],
    };

    const response = await graphqlRequest(mutation, 'tendersAward', args, { user: _user });

    mock.restore();

    expect(response.winnerIds.length).toBe(1);
    expect(response.awardNote).toBe('note');
  });

  const sendRegretLetterMmutation = `
    mutation tendersSendRegretLetter($_id: String!, $subject: String!, $content: String!) {
      tendersSendRegretLetter(_id: $_id, subject: $subject, content: $content)
    }
  `;

  test('Send regret letter: rfq', async () => {
    const supplier = await companyFactory({});
    const supplierId = supplier._id;
    const tender = await tenderFactory({ status: 'open', isToAll: true });
    const tenderId = tender._id.toString();

    await tender.update({ winnerIds: encryptArray([supplierId]) });

    const chosen = await tenderResponseFactory({ tenderId, supplierId });
    const notAwarded1 = await tenderResponseFactory({ tenderId });
    const notAwarded2 = await tenderResponseFactory({ tenderId });

    const args = { _id: tenderId, subject: 'subject', content: 'content' };
    const response = await graphqlRequest(
      sendRegretLetterMmutation,
      'tendersSendRegretLetter',
      args,
    );

    const updatedTender = await Tenders.findOne({ _id: tenderId });

    expect(response).not.toContain(chosen.supplierId);
    expect(response).toContain(notAwarded1.supplierId);
    expect(response).toContain(notAwarded2.supplierId);

    expect(updatedTender.sentRegretLetter).toBe(true);
  });

  test('Send regret letter: eoi', async () => {
    const supplier = await companyFactory({});
    const supplierId = supplier._id;
    const tender = await tenderFactory({ status: 'open', type: 'eoi', isToAll: true });
    const tenderId = tender._id.toString();

    await tender.update({ bidderListedSupplierIds: encryptArray([supplierId]) });

    const chosen = await tenderResponseFactory({ tenderId, supplierId, isSent: true });

    const notInterested = await tenderResponseFactory({
      tenderId,
      isNotInterested: true,
      isSent: true,
    });
    const notChosen1 = await tenderResponseFactory({ tenderId, isSent: true });
    const notChosen2 = await tenderResponseFactory({ tenderId, isSent: true });

    const args = { _id: tenderId, subject: 'subject', content: 'content' };
    const response = await graphqlRequest(
      sendRegretLetterMmutation,
      'tendersSendRegretLetter',
      args,
    );

    const updatedTender = await Tenders.findOne({ _id: tenderId });

    expect(response).not.toContain(notInterested.supplierId);
    expect(response).not.toContain(chosen.supplierId);
    expect(response).toContain(notChosen1.supplierId);
    expect(response).toContain(notChosen2.supplierId);

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

    const user = await userFactory({ isSupplier: false });
    const tender = await tenderFactory({ createdUserId: user._id });
    const args = { _id: tender._id };

    const response = await graphqlRequest(mutation, 'tendersCancel', args, { user });

    expect(response.status).toBe('canceled');
  });

  test('Send response', async () => {
    const company = await companyFactory();
    const tender = await tenderFactory({ status: 'open', isToAll: true });
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
