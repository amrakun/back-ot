/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Feedbacks } from '../db/models';
import { feedbackFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Feedback queries', () => {
  afterEach(async () => {
    // Clearing test data
    await Feedbacks.remove({});
  });

  const feedbackFields = `
    _id
    status
    closeDate
    supplierIds
    content
    createdDate
    createdUserId
  `;

  test('feedbacks', async () => {
    await feedbackFactory();
    await feedbackFactory();

    const query = `
      query feedbacks {
        feedbacks {
          ${feedbackFields}
        }
      }
    `;

    // When there is no filter, it must return all feedbacks =============
    let response = await graphqlRequest(query, 'feedbacks', {});

    expect(response.length).toBe(2);
  });

  test('feedback detail', async () => {
    const feedback = await feedbackFactory();

    const query = `
      query feedbackDetail($_id: String!) {
        feedbackDetail(_id: $_id) {
          ${feedbackFields}
        }
      }
    `;

    // When there is no filter, it must return all feedbacks =============
    const response = await graphqlRequest(query, 'feedbackDetail', { _id: feedback._id });

    expect(response._id).toBe(feedback._id);
  });
});
