/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import sinon from 'sinon';
import { connect, disconnect } from '../db/connection';
import { Configs, Tenders, Companies, Users, BlockedCompanies } from '../db/models';
import { configFactory, tenderFactory, companyFactory, userFactory } from '../db/factories';

import dataUtils from '../data/utils';
import { sendEmailToSuppliers } from '../data/tenderUtils';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender utils', () => {
  let user;

  beforeEach(async () => {
    await configFactory();
    user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Configs.remove({});
    await Tenders.remove({});
    await Companies.remove({});
    await BlockedCompanies.remove({});
  });

  test('send email to suppliers', async () => {
    const mock = sinon.stub(dataUtils, 'sendEmail').callsFake(() => 'sent');

    const sup1 = await companyFactory({
      contactInfo: { email: 'sup1@gmail.com', name: '1', phone: 1 },
    });
    const sup2 = await companyFactory({
      contactInfo: { email: 'sup2@gmail.com', name: '2', phone: 2 },
    });
    const sup3 = await companyFactory({
      contactInfo: { email: 'sup3@gmail.com', name: '3', phone: 3 },
    });
    const sup4 = await companyFactory({
      contactInfo: { email: 'sup4@gmail.com', name: '4', phone: 4 },
    });
    const sup5 = await companyFactory({
      contactInfo: { email: 'sup5@gmail.com', name: '5', phone: 5 },
    });

    // block sup4, sup5 =================
    const blockDoc = {
      groupId: 'DFADFFASFD',
      startDate: moment().subtract(2, 'hours'),
      endDate: moment().add(2, 'hours'),
    };

    await BlockedCompanies.block({ ...blockDoc, supplierId: sup4._id }, user._id);
    await BlockedCompanies.block({ ...blockDoc, supplierId: sup5._id }, user._id);

    const tender = await tenderFactory({
      supplierIds: [sup1._id, sup2._id, sup3._id, sup4._id, sup5._id],
    });

    const emailSentCount = await sendEmailToSuppliers({
      kind: 'supplier__publish',
      attachments: [],
      tender,
    });

    // sup4, sup5 must be excluded
    expect(emailSentCount).toBe(6);

    mock.restore();
  });
});
