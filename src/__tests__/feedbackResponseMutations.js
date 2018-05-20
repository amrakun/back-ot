/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Configs, FeedbackResponses } from '../db/models';
import { configFactory, userFactory, companyFactory, feedbackFactory } from '../db/factories';
import feedbackResponseMutations from '../data/resolvers/mutations/feedbackResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Feedback mutations', () => {
  beforeEach(async () => {
    await configFactory();
  });

  afterEach(async () => {
    await Configs.remove({});
    await FeedbackResponses.remove({});
  });

  const commonParams = `
    $feedbackId: String!
    $supplierId: String!

    $totalEmploymentOt: Float!
    $totalEmploymentUmnugovi: Float!
    $employmentChangesAfter: Float!
    $numberOfEmployeeWorkToScopeNational: Float!
    $numberOfEmployeeWorkToScopeUmnugovi: Float!
    $procurementTotalSpend: Float!
    $procurementNationalSpend: Float!
    $procurementUmnugoviSpend: Float!

    $corporateSocial: String!
    $otherStories: String!
  `;

  const commonValues = `
    feedbackId: $feedbackId
    supplierId: $supplierId

    totalEmploymentOt: $totalEmploymentOt
    totalEmploymentUmnugovi: $totalEmploymentUmnugovi
    employmentChangesAfter: $employmentChangesAfter
    numberOfEmployeeWorkToScopeNational: $numberOfEmployeeWorkToScopeNational
    numberOfEmployeeWorkToScopeUmnugovi: $numberOfEmployeeWorkToScopeUmnugovi
    procurementTotalSpend: $procurementTotalSpend
    procurementNationalSpend: $procurementNationalSpend
    procurementUmnugoviSpend: $procurementUmnugoviSpend

    corporateSocial: $corporateSocial
    otherStories: $otherStories
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
    const feedback = await feedbackFactory();
    const supplier = await companyFactory();

    const doc = {
      feedbackId: feedback._id,
      supplierId: supplier._id,

      totalEmploymentOt: 10,
      totalEmploymentUmnugovi: 10,
      employmentChangesAfter: 10,
      numberOfEmployeeWorkToScopeNational: 10,
      numberOfEmployeeWorkToScopeUmnugovi: 10,
      procurementTotalSpend: 10,
      procurementNationalSpend: 10,
      procurementUmnugoviSpend: 10,

      corporateSocial: 'corporateSocial',
      otherStories: 'otherStories',
    };

    const mutation = `
      mutation feedbackResponsesAdd(${commonParams}) {
        feedbackResponsesAdd(${commonValues}) {
          _id
          status
          feedbackId
          supplierId
          totalEmploymentOt
          totalEmploymentUmnugovi
          employmentChangesAfter
          numberOfEmployeeWorkToScopeNational
          numberOfEmployeeWorkToScopeUmnugovi
          procurementTotalSpend
          procurementNationalSpend
          procurementUmnugoviSpend
          corporateSocial
          otherStories
          createdDate
        }
      }
    `;

    const user = await userFactory({ isSupplier: true });

    await graphqlRequest(mutation, 'feedbackResponsesAdd', doc, { user });

    expect(await FeedbackResponses.find().count()).toBe(1);
  });
});
