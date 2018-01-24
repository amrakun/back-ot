/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users } from '../db/models';
import { userFactory, companyFactory, auditFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('report query permission checks', () => {
  const _reportsSuppliersExport = ctx =>
    graphqlRequest(
      `
    query reportsSuppliersExport($productCodes: [String], $isPrequalified: Boolean) {
      reportsSuppliersExport(productCodes: $productCodes, isPrequalified: $isPrequalified)
    }`,
      'reportsSuppliersExport',
      {},
      ctx,
    );

  const _reportsTendersExport = ctx =>
    graphqlRequest(
      `
    query reportsTendersExport($type: ReportsTendersType, $publishDate: DateInterval, $closeDate: DateInterval) {
      reportsTendersExport(type: $type, publishDate: $publishDate, closeDate: $closeDate)
    }`,
      'reportsTendersExport',
      {},
      ctx,
    );

  const assertQueryToThrowException = async (query, ctx, errMessage) => {
    try {
      await query(ctx);
    } catch (errors) {
      for (let err of errors) {
        expect(err.message).toBe(errMessage);
      }
    }
  };

  let _buyer;
  let _supplier;

  beforeAll(async () => {
    _buyer = await userFactory({ isSupplier: false });
    _supplier = await userFactory({ isSupplier: true });
  });

  afterAll(async () => {
    await Users.remove({});
  });

  describe('reportsSuppliersExport', () => {
    test('permission errors', async () => {
      expect.assertions(2);

      assertQueryToThrowException(_reportsSuppliersExport, {}, 'Login required');
      assertQueryToThrowException(
        _reportsSuppliersExport,
        { user: _supplier },
        'Permission denied',
      );
    });

    test('succesfull access', async () => {
      expect.assertions(1);
      expect(await _reportsSuppliersExport({ user: _buyer })).toBeDefined(); // to be called without problems
    });
  });

  describe('reportsTendersExport', () => {
    test('permission errors', async () => {
      expect.assertions(2);

      assertQueryToThrowException(_reportsTendersExport, {}, 'Login required');
      assertQueryToThrowException(_reportsTendersExport, { user: _supplier }, 'Permission denied');
    });

    test('succesfull access', async () => {
      expect.assertions(1);
      expect(await _reportsSuppliersExport({ user: _buyer })).toBeDefined(); // to be called without problems
    });
  });

  describe('reportsAuditExport', () => {
    test('permission errors', async () => {
      expect.assertions(3);

      const companyA = await companyFactory({
        enName: 'Company name',
      });
      const companyB = await companyFactory({
        enName: 'Company name B',
      });
      await auditFactory({
        supplierIds: [companyA._id, companyB._id],
      });

      const companyC = await companyFactory({
        enName: 'Company name C',
      });
      const companyD = await companyFactory({
        enName: 'Company name D',
      });
      await auditFactory({
        supplierIds: [companyC._id, companyD._id],
      });

      const reportAuditExport = ctx =>
        graphqlRequest(
          `
          query reportsAuditExport($type: String, $publishDate: DateInterval, $closeDate: DateInterval) {
            reportsAuditExport(type: $type, publishDate: $publishDate, closeDate: $closeDate)
          }`,
          'reportsAuditExport',
          {},
          ctx,
        );

      const response = await reportAuditExport({ user: _buyer });

      expect(response.errors).toBeUndefined();
      assertQueryToThrowException(reportAuditExport, {}, 'Login required');
      assertQueryToThrowException(reportAuditExport, { user: _supplier }, 'Permission denied');
    });
  });
});
