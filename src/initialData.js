#!/usr/bin/env node
'use strict';

import faker from 'faker';
import { Users, Tenders, Companies } from './db/models';
import { connect, disconnect } from './db/connection';
import { companyFactory, tenderFactory, tenderResponseFactory } from './db/factories';

export const importData = async () => {
  connect();

  // create admin
  await Users.createUser({
    username: 'admin',
    password: 'admin123',
    isSupplier: false,
    role: 'admin',
    email: 'admin@ot.mn',
  });

  let i = 0;

  // create suppliers & companies
  while (i < 10) {
    const company = await companyFactory({
      averageDifotScore: 1,
      isProductsInfoValidated: true,
      productsInfo: ['a01001', 'a01002'],
    });

    const email = i === 0 ? 'supplier@ot.mn' : faker.internet.email();

    // create supplier
    await Users.create({
      username: email,
      email,
      isSupplier: true,
      password: await Users.generatePassword('supplier123'),
      companyId: company._id,
    });

    i++;
  }

  i = 0;

  // create tenders
  while (i < 9) {
    const suppliers = await Companies.find({});
    const supplierIds = suppliers.map(s => s._id);

    const tender = await tenderFactory({
      type: i % 2 === 0 ? 'rfq' : 'eoi',
      supplierIds,
    });

    if (i % 3 === 0) {
      await Tenders.update(
        { _id: tender._id },
        { $set: { status: 'open', publishDate: new Date() } },
      );
    }

    // create responses
    for (let supplierId of supplierIds) {
      await tenderResponseFactory({
        tenderId: tender._id,
        supplierId,
        notInterested: i % 2 === 0,
      });
    }

    i++;
  }

  disconnect();
};

importData();
