/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Feedbacks } from '../db/models';
import { userFactory, feedbackFactory, companyFactory } from '../db/factories';

import feedbackMutations from '../data/resolvers/mutations/feedbacks';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Feedback mutations', () => {
  let _feedback;
  let _user;

  const commonParams = `
    $closeDate: Date!,
    $supplierIds: [String]!,
    $content: String!,
  `;

  const commonValues = `
    closeDate: $closeDate,
    supplierIds: $supplierIds,
    content: $content,
  `;

  beforeEach(async () => {
    // Creating test data
    _feedback = await feedbackFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Feedbacks.remove({});
    await Users.remove({});
  });

  test('Feedbacks login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(1);

    // add feedback
    checkLogin(feedbackMutations.feedbacksAdd, {});
  });

  test('Create feedback', async () => {
    const supplier = await companyFactory();

    Feedbacks.createFeedback = jest.fn(() => ({ _id: 'DFAFSFASDF', supplierIds: [supplier._id] }));

    const mutation = `
      mutation feedbacksAdd(${commonParams}) {
        feedbacksAdd(${commonValues}) {
          _id
        }
      }
    `;

    delete _feedback._id;
    delete _feedback.status;
    _feedback.closeDate = new Date(_feedback.closeDate);

    await graphqlRequest(mutation, 'feedbacksAdd', _feedback, { user: _user });

    expect(Feedbacks.createFeedback.mock.calls.length).toBe(1);
    expect(Feedbacks.createFeedback).toBeCalledWith(_feedback, _user._id);
  });
});