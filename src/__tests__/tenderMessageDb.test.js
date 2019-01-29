/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderMessages } from '../db/models';

import { userFactory, tenderFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('TenderMessage db', () => {
  afterEach(async () => {
    // Clearing test data
    await TenderMessages.remove({});
    await Tenders.remove({});
    await Users.remove({});
  });

  test('Check file permission', async () => {
    const admin = await userFactory({ isSupplier: false });
    const supplier1 = await userFactory({ isSupplier: true });
    const supplier2 = await userFactory({ isSupplier: true });
    const tender = await tenderFactory();

    await TenderMessages.tenderMessageBuyerSend(
      {
        tenderId: tender._id,
        subject: 'attach',
        body: 'attach',
        recipientSupplierIds: [supplier1.companyId],
        attachment: { url: 'attach10.png', name: '/attach10' },
      },
      admin,
    );

    expect(await TenderMessages.isAuthorizedToDownload('attach10.png', admin)).toBe(true);
    expect(await TenderMessages.isAuthorizedToDownload('attach10.png', supplier1)).toBe(true);
    expect(await TenderMessages.isAuthorizedToDownload('attach10.png', supplier2)).toBe(false);

    expect(await TenderMessages.isAuthorizedToDownload('attach999.png', supplier1)).toBe(false);
    expect(await TenderMessages.isAuthorizedToDownload('attach999.png', supplier2)).toBe(false);
  });
});
