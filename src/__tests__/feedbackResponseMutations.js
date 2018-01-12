/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { FeedbackResponses } from '../db/models';
import { userFactory } from '../db/factories';
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

  test('FeedbackResponses supplier required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(1);

    const user = await userFactory();

    // add feedback
    checkLogin(feedbackResponseMutations.feedbackResponsesAdd, {}, { user });
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

    const user = await userFactory({ isSupplier: true });

    await graphqlRequest(mutation, 'feedbackResponsesAdd', doc, { user });

    expect(FeedbackResponses.createFeedbackResponse.mock.calls.length).toBe(1);
    expect(FeedbackResponses.createFeedbackResponse).toBeCalledWith(doc);
  });
});
