/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { Users, DueDiligences, Companies } from '../db/models';
import { companyFactory, userFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Due Diligence model test', () => {
  test('Create Due Diligence 2 or 3', async () => {
    const company = await companyFactory({});
    const supplierIds = ['id1', 'id2'];
    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      risk: 'low',
    });

    expect(dueDiligence.risk).toBe('low');
  });
});
