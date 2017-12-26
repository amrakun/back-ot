/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Tenders, TenderResponses, Companies } from '../db/models';
import { tenderFactory, companyFactory } from '../db/factories';
import tenderResponseMutations from '../data/resolvers/mutations/tenderResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender mutations', () => {
  let _tender;
  let _company;

  const commonParams = `
    $tenderId: String!,
    $supplierId: String!,
    $isNotInterested: Boolean,
    $respondedProducts: [TenderRespondedProductInput]
    $respondedDocuments: [TenderRespondedDocumentInput]
  `;

  const commonValues = `
    tenderId: $tenderId,
    supplierId: $supplierId,
    isNotInterested: $isNotInterested,
    respondedProducts: $respondedProducts
    respondedDocuments: $respondedDocuments
  `;

  beforeEach(async () => {
    // Creating test data
    _tender = await tenderFactory();
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tenders.remove({});
    await TenderResponses.remove({});
    await Companies.remove({});
  });

  test('TenderResponses login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(1);

    // add tender
    checkLogin(tenderResponseMutations.tenderResponsesAdd, {
      tenderId: _tender._id,
      supplierId: _company._id,
    });
  });

  test('Create tender response', async () => {
    TenderResponses.createTenderResponse = jest.fn(() => ({ _id: 'DFAFDA' }));

    const doc = {
      tenderId: 'tenderId',
      supplierId: 'supplierId',
      isNotInterested: false,
      respondedProducts: [
        {
          code: 'code',
          suggestedManufacturer: 'suggestedManufacturer',
          suggestedManufacturerPartNumber: 1,
          unitPrice: 1000,
          totalPrice: 20000,
          leadTime: 1,
          comment: 'comment',
          file: { name: 'name', url: 'url' },
        },
      ],
      respondedDocuments: [
        {
          name: 'name',
          isSubmitted: true,
          notes: 'notes',
          file: { name: 'name', url: 'url' },
        },
      ],
    };

    const mutation = `
      mutation tenderResponsesAdd(${commonParams}) {
        tenderResponsesAdd(${commonValues}) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'tenderResponsesAdd', doc);

    expect(TenderResponses.createTenderResponse.mock.calls.length).toBe(1);
    expect(TenderResponses.createTenderResponse).toBeCalledWith(doc);
  });
});
