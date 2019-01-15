/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Tenders, TenderResponses, Companies } from '../db/models';
import { userFactory, tenderFactory, tenderResponseFactory, companyFactory } from '../db/factories';

import tenderResponseMutations from '../data/resolvers/mutations/tenderResponses';

beforeAll(() => connect());

afterAll(() => disconnect());

const toObject = data => {
  return JSON.parse(JSON.stringify(data));
};

describe('Tender mutations', () => {
  let _tender;
  let _company;

  const commonParams = `
    $tenderId: String!,
    $isNotInterested: Boolean,
    $respondedProducts: [TenderRespondedProductInput]
    $respondedDocuments: [TenderRespondedDocumentInput]
  `;

  const commonValues = `
    tenderId: $tenderId,
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

  test('TenderResponses supplier required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(2);

    const user = await userFactory();

    for (const mutation of ['tenderResponsesAdd', 'tenderResponsesEdit']) {
      checkLogin(
        tenderResponseMutations[mutation],
        {
          tenderId: _tender._id,
          supplierId: _company._id,
        },
        { user },
      );
    }
  });

  test('Create tender response', async () => {
    const tender = await tenderFactory({ status: 'open' });

    const doc = {
      tenderId: tender._id,
      isNotInterested: false,
      respondedProducts: [
        {
          code: 'code',
          suggestedManufacturer: 'suggestedManufacturer',
          suggestedManufacturerPartNumber: '1',
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
          isNotInterested
          respondedProducts {
            code
            suggestedManufacturer
            suggestedManufacturerPartNumber
            unitPrice
            totalPrice
            leadTime
            comment
            file
          }

          respondedDocuments {
            name
            isSubmitted
            notes
            file
          }
        }
      }
    `;

    const user = await userFactory({ isSupplier: true });

    const response = await graphqlRequest(mutation, 'tenderResponsesAdd', doc, { user });

    expect(response.isNotInterested).toBe(doc.isNotInterested);
    expect(toObject(response.respondedProducts)).toEqual(doc.respondedProducts);
    expect(toObject(response.respondedDocuments)).toEqual(doc.respondedDocuments);
  });

  test('Update tender response', async () => {
    const user = await userFactory({ isSupplier: true });
    const tender = await tenderFactory({ status: 'open' });

    await tenderResponseFactory({ tenderId: tender._id, supplierId: user.companyId });

    const doc = {
      tenderId: tender._id,
      isNotInterested: false,
      respondedProducts: [
        {
          code: 'code',
          suggestedManufacturer: 'suggestedManufacturer',
          suggestedManufacturerPartNumber: '1',
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

    const updatedResponse = await graphqlRequest(
      `
        mutation tenderResponsesEdit(${commonParams}) {
          tenderResponsesEdit(${commonValues}) {
            _id
            respondedProducts {
              code
              suggestedManufacturer
              suggestedManufacturerPartNumber
              unitPrice
              totalPrice
              leadTime
              comment
              file
            }

            respondedDocuments {
              name
              isSubmitted
              notes
              file
            }
          }
        }
      `,
      'tenderResponsesEdit',
      doc,
      { user },
    );

    expect(toObject(updatedResponse.respondedProducts)).toEqual(doc.respondedProducts);
    expect(toObject(updatedResponse.respondedDocuments)).toEqual(doc.respondedDocuments);
  });
});
