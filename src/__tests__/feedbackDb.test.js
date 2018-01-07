/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Feedbacks, FeedbackResponses } from '../db/models';
import { userFactory, feedbackFactory, feedbackResponseFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Feedback db', () => {
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Feedbacks.remove({});
    await FeedbackResponses.remove({});
    await Users.remove({});
  });

  test('Create feedback', async () => {
    const doc = { closeDate: new Date(), supplierIds: ['id1', 'id2'], content: 'content' };

    const feedbackObj = await Feedbacks.createFeedback(doc, _user._id);

    expect(feedbackObj.closeDate).toEqual(doc.closeDate);
    expect(feedbackObj.supplierIds).toContain('id1');
    expect(feedbackObj.supplierIds).toContain('id2');
    expect(feedbackObj.content).toEqual(doc.content);

    expect(feedbackObj.createdDate).toBeDefined();
    expect(feedbackObj.status).toEqual('open');
    expect(feedbackObj.createdUserId).toEqual(_user._id);
  });

  test('Create feedback response', async () => {
    expect.assertions(3);

    const doc = await feedbackResponseFactory();
    delete doc._id;
    await FeedbackResponses.remove({});

    let feedbackResponseObj = await FeedbackResponses.createFeedbackResponse({ ...doc });

    feedbackResponseObj = JSON.parse(JSON.stringify(feedbackResponseObj));

    const status = feedbackResponseObj.status;
    delete feedbackResponseObj.__v;
    delete feedbackResponseObj._id;
    delete feedbackResponseObj.status;

    expect(status).toEqual('onTime');
    expect(feedbackResponseObj).toEqual(doc);

    // try to resend
    try {
      await FeedbackResponses.createFeedbackResponse(doc);
    } catch (e) {
      expect(e.message).toBe('Already sent');
    }
  });

  test('Create feedback response: status late', async () => {
    const doc = await feedbackResponseFactory();
    delete doc._id;

    await FeedbackResponses.remove({});

    // mark feedback as closed
    await Feedbacks.update({ _id: doc.feedbackId }, { $set: { status: 'closed' } });

    let feedbackResponseObj = await FeedbackResponses.createFeedbackResponse({ ...doc });

    feedbackResponseObj = JSON.parse(JSON.stringify(feedbackResponseObj));

    const status = feedbackResponseObj.status;
    delete feedbackResponseObj.__v;
    delete feedbackResponseObj._id;
    delete feedbackResponseObj.status;

    expect(status).toBe('late');
    expect(feedbackResponseObj).toEqual(doc);

    // try to resend
    try {
      await FeedbackResponses.createFeedbackResponse(doc);
    } catch (e) {
      expect(e.message).toBe('Already sent');
    }
  });

  test('Close opens', async () => {
    let feedback1 = await feedbackFactory({ closeDate: new Date() });
    let feedback2 = await feedbackFactory({ closeDate: new Date('2040-01-01') });

    await Feedbacks.update(
      { _id: { $in: [feedback1._id, feedback2._id] } },
      { $set: { status: 'open' } },
      { multi: true },
    );

    await Feedbacks.closeOpens();

    feedback1 = await Feedbacks.findOne({ _id: feedback1._id });
    feedback2 = await Feedbacks.findOne({ _id: feedback2._id });

    expect(feedback1.status).toBe('closed');
    expect(feedback2.status).toBe('open');
  });
});
