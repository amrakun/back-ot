/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { FeedbackResponses } from '../db/models';
import feedbackResponseMutations from '../data/resolvers/mutations/feedbackResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Feedback mutations', () => {
  const commonParams = `
    $feedbackId: String!,
    $supplierId: String!,
    $employmentNumberBefore: Float!,
    $employmentNumberNow: Float!,
    $nationalSpendBefore: Float!,
    $nationalSpendAfter: Float!,
    $umnugobiSpendBefore: Float!,
    $umnugobiSpendAfter: Float!,
    $investment: String!,
    $trainings: String!,
    $corporateSocial: String!,
    $technologyImprovement: String!,
  `;

  const commonValues = `
    feedbackId: $feedbackId,
    supplierId: $supplierId,
    employmentNumberBefore: $employmentNumberBefore,
    employmentNumberNow: $employmentNumberNow,
    nationalSpendBefore: $nationalSpendBefore,
    nationalSpendAfter: $nationalSpendAfter,
    umnugobiSpendBefore: $umnugobiSpendBefore,
    umnugobiSpendAfter: $umnugobiSpendAfter,
    investment: $investment,
    trainings: $trainings,
    corporateSocial: $corporateSocial,
    technologyImprovement: $technologyImprovement,
  `;

  test('FeedbackResponses login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(1);

    // add feedback
    checkLogin(feedbackResponseMutations.feedbackResponsesAdd, {});
  });

  test('Create feedback response', async () => {
    FeedbackResponses.createFeedbackResponse = jest.fn(() => ({ _id: 'DFAFDA' }));

    const doc = {
      feedbackId: 'feedbackId',
      supplierId: 'supplierId',
      employmentNumberBefore: 10,
      employmentNumberNow: 10,
      nationalSpendBefore: 10,
      nationalSpendAfter: 10,
      umnugobiSpendBefore: 10,
      umnugobiSpendAfter: 10,

      investment: 'investment',
      trainings: 'trainings',
      corporateSocial: 'corporateSocial',
      technologyImprovement: 'technologyImprovement',
    };

    const mutation = `
      mutation feedbackResponsesAdd(${commonParams}) {
        feedbackResponsesAdd(${commonValues}) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'feedbackResponsesAdd', doc);

    expect(FeedbackResponses.createFeedbackResponse.mock.calls.length).toBe(1);
    expect(FeedbackResponses.createFeedbackResponse).toBeCalledWith(doc);
  });
});
