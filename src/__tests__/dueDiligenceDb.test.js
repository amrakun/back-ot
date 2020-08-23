/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { Users, DueDiligences, Companies, Qualifications } from '../db/models';
import { companyFactory, userFactory } from '../db/factories';
import { FinancialInfoSchema } from '../db/models/Companies';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Due Diligence model test', () => {
  const generateDoc = (schema, qualified) => {
    const doc = {};

    Qualifications.getFieldsBySchema(schema).forEach((name, index) => {
      doc[name] = qualified || index % 2 === 0;
    });

    return doc;
  };
  test('Create Due Diligence Check', async () => {
    const date = new Date();
    const supplierIds = ['id1'];
    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: date,
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: date,
      files: { name: 'amra', url: 'jrgl' },
    });

    const checkCreating = await DueDiligences.getLastDueDiligence('id1');

    expect(checkCreating).toBeDefined();
    expect(dueDiligence).toBeDefined();
    expect(dueDiligence2).toBeDefined();
    expect(dueDiligence.date).toBe(date);
    expect(dueDiligence.supplierId).toBeDefined();
  });

  test('Update Section', async () => {
    const supplierIds = ['id1'];
    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'asdf', url: 'assadfdf' },
    });
    const doc = generateDoc(FinancialInfoSchema);

    const checkUpdateSection = await DueDiligences.updateSection(supplierIds, 'basicInfo', doc);
    expect(checkUpdateSection).toBeDefined();
  });

  test('Save and Cancel', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id, {
      basicInfo: { enName: 'enName ', mnName: 'mnName ' },
    });
    const supplierIds = company._id;

    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'amra', url: 'jrgl' },
    });

    const cancelDueDiligence = await DueDiligences.cancelDueDiligence(supplierIds);
    const saveDueDiligence = await DueDiligences.saveDueDiligence(supplierIds, company);

    expect(saveDueDiligence).toBeDefined();
    expect(cancelDueDiligence).toBeDefined();
  });

  test('enable and update', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id, {
      basicInfo: { enName: 'enName ', mnName: 'mnName ' },
    });
    const supplierIds = company._id;

    const enable = await DueDiligences.enableDueDiligence(supplierIds);

    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'amra', url: 'jrgl' },
    });

    const doc = generateDoc(FinancialInfoSchema);

    const update = await DueDiligences.enableDueDiligence(supplierIds, { doc });

    expect(enable).toBeDefined();
    expect(update).toBeDefined();
  });

  test('remove risk', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id, {
      basicInfo: { enName: 'enName ', mnName: 'mnName ' },
    });
    const supplierIds = company._id;

    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'amra', url: 'jrgl' },
    });

    const removeRisk = await DueDiligences.removeRisk(supplierIds);

    expect(removeRisk).toBeDefined();
  });

  test('companyId', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id, {
      basicInfo: { enName: 'enName ', mnName: 'mnName ' },
    });
    const supplierIds = company._id;

    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'amra', url: 'jrgl' },
    });

    const idArray = [dueDiligence2._id, dueDiligence._id];

    const random = idArray[Math.floor(idArray.length * Math.random())];

    const companyIds = await DueDiligences.companyIds(random);

    expect(companyIds).toBeDefined();
  });

  test('getDueDiligenceConfig', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id, {
      basicInfo: { enName: 'enName ', mnName: 'mnName ' },
    });
    const supplierIds = company._id;

    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const config = await DueDiligences.getDueDiligenceConfig(dueDiligence.supplierId);

    expect(config).toBeDefined();
  });

  test('Reset Due Diligence', async () => {
    const user = await userFactory({});
    const company = await Companies.createCompany(user._id, {
      basicInfo: { enName: 'enName ', mnName: 'mnName ' },
    });

    const supplierIds = company._id;

    const dueDiligence = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'hello', url: 'asdf' },
    });

    const dueDiligence2 = await DueDiligences.createDueDiligence(supplierIds, {
      date: new Date(),
      files: { name: 'amra', url: 'jrgl' },
    });

    const random = supplierIds[Math.floor(supplierIds.length * Math.random())];
    const companyIds = await DueDiligences.companyIds(random);

    const reset = await DueDiligences.resetDueDiligence(companyIds);

    expect(reset).toBeDefined();
  });
});
