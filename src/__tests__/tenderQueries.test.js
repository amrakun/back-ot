/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { Users, Tenders, TenderResponses, Companies } from '../db/models';
import { userFactory, tenderFactory, tenderResponseFactory, companyFactory } from '../db/factories';

import tenderQueries from '../data/resolvers/queries/tenders';
import tenderResponseQueries from '../data/resolvers/queries/tenderResponses';
import tenderResponseExports from '../data/resolvers/queries/tenderResponseExports';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tender queries', () => {
  let user;
  let supplier1;
  let supplier2;

  const commonParams = `
    $type: String,
    $status: String,
    $search: String,
    $perPage: Int,
    $page: Int,
  `;

  const commonValues = `
    type: $type,
    status: $status,
    search: $search,
    perPage: $perPage,
    page: $page,
  `;

  const query = `
    query tenders(${commonParams}) {
      tenders(${commonValues}) {
        _id
        type
        status
        createdDate
        supplierIds
        sourcingOfficer
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Tenders.remove({});
    await TenderResponses.remove({});
    await Companies.remove({});
  });

  test('Buyer required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(11);

    const user = await userFactory({ isSupplier: true });

    const queries = [
      'tenders',
      'tenderDetail',
      'tenderCountByStatus',
      'tendersAverageDuration',
      'tendersTotalCount',
      'tendersExport',
    ];

    for (let query of queries) {
      checkLogin(tenderQueries[query], {}, { user });
    }

    const responseQueries = ['tenderResponses', 'tenderResponseDetail'];

    for (let query of responseQueries) {
      checkLogin(tenderResponseQueries[query], {}, { user });
    }

    const responseExportsQueries = [
      'tenderResponsesRfqBidSummaryReport',
      'tenderResponsesEoiShortList',
      'tenderResponsesEoiBidderList',
    ];

    for (let query of responseExportsQueries) {
      checkLogin(tenderResponseExports[query], {}, { user });
    }
  });

  test('Supplier required', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(3);

    const user = await userFactory({ isSupplier: false });

    for (let query of ['tendersSupplier', 'tenderDetailSupplier']) {
      checkLogin(tenderQueries[query], {}, { user });
    }

    for (let query of ['tenderResponseByUser']) {
      checkLogin(tenderResponseQueries[query], {}, { user });
    }
  });

  test('tenders', async () => {
    // Creating test data ==============

    supplier1 = await companyFactory();
    supplier2 = await companyFactory();

    user = await userFactory({ companyId: supplier1._id, isSupplier: false });

    const tender = await tenderFactory({ type: 'rfq' });

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier1._id,
      isNotInterested: true,
    });

    await tenderFactory({
      type: 'rfq',
      status: 'open',
      name: 'test',
      publishDate: new Date('2012-01-01'),
      closeDate: new Date('2012-02-01'),
    });

    await tenderFactory({ type: 'rfq', supplierIds: [supplier1._id], number: 'number' });
    await tenderFactory({ type: 'eoi', supplierIds: [supplier2._id], number: '2' });

    // When there is no filter, it must return all tenders =============
    let response = await graphqlRequest(query, 'tenders', {});

    expect(response.length).toBe(4);

    // filter by type ===============
    response = await graphqlRequest(query, 'tenders', { type: 'rfq' });

    expect(response.length).toBe(3);
    expect(response[0].type).toBe('rfq');

    response = await graphqlRequest(query, 'tenders', { type: 'eoi' });

    expect(response.length).toBe(1);
    expect(response[0].type).toBe('eoi');

    // status ===============
    response = await graphqlRequest(query, 'tenders', { status: 'open' }, { user });
    expect(response.length).toBe(1);

    response = await graphqlRequest(query, 'tenders', { status: 'draft' }, { user });
    expect(response.length).toBe(3);

    response = await graphqlRequest(query, 'tenders', { status: 'draft,open' }, { user });
    expect(response.length).toBe(4);

    // name ===============
    response = await graphqlRequest(query, 'tenders', { search: 'test' }, { user });
    expect(response.length).toBe(1);

    // type and number ===============
    response = await graphqlRequest(query, 'tenders', { type: 'rfq', search: 'number' }, { user });
    expect(response.length).toBe(1);

    // number & pager ===============
    response = await graphqlRequest(
      query,
      'tenders',
      { search: '2', perPage: 10, page: 1 },
      { user },
    );

    expect(response.length).toBe(1);
  });

  test('count by tender status', async () => {
    const qry = `
      query tenderCountByStatus(
        $startDate: Date!,
        $endDate: Date!
        $type: String!,
      ) {
        tenderCountByStatus(
          startDate: $startDate,
          endDate: $endDate,
          type: $type
        )
      }
    `;

    const user = await userFactory();
    const t1Date = new Date();
    const t2Date = moment()
      .add(1, 'day')
      .endOf('day')
      .toDate(); // 1 days later

    // below tender must be ignored by createdUserId check ========
    const ignoredUser = await userFactory();

    await tenderFactory({
      publishDate: t1Date,
      type: 'rfq',
      status: 'open',
      createdUserId: ignoredUser._id,
    });

    await tenderFactory({
      publishDate: t1Date,
      type: 'rfq',
      status: 'open',
      createdUserId: user._id,
    });

    await tenderFactory({
      publishDate: t2Date,
      type: 'rfq',
      status: 'closed',
      createdUserId: user._id,
    });

    const startDate = moment()
      .add(-1, 'day')
      .endOf('day'); // 1 day ago

    const endDate = moment()
      .add(2, 'day')
      .endOf('day'); // 2 days later

    const args = { startDate, endDate, type: 'rfq' };
    const context = { user };

    const response = await graphqlRequest(qry, 'tenderCountByStatus', args, context);

    expect(response[t1Date.toLocaleDateString()]).toEqual({ open: 1, closed: 0 });
    expect(response[t2Date.toLocaleDateString()]).toEqual({ closed: 1, open: 0 });
  });

  test('total tenders count', async () => {
    const qry = `
      query tendersTotalCount(
        $startDate: Date!,
        $endDate: Date!
        $type: String!,
      ) {
        tendersTotalCount(
          startDate: $startDate,
          endDate: $endDate,
          type: $type
        )
      }
    `;

    // below tender must be ignored by createdUserId check =====
    const ignoredUser = await userFactory();

    await tenderFactory({
      publishDate: new Date(),
      type: 'rfq',
      createdUserId: ignoredUser._id,
    });

    const user = await userFactory({});

    await tenderFactory({
      publishDate: new Date(),
      type: 'rfq',
      createdUserId: user._id,
    });

    await tenderFactory({
      publishDate: moment()
        .add(1, 'day')
        .endOf('day')
        .toDate(), // 1 days later,
      type: 'eoi',
      createdUserId: user._id,
    });

    const startDate = moment()
      .add(-1, 'day')
      .endOf('day'); // 1 day ago

    const endDate = moment()
      .add(2, 'day')
      .endOf('day'); // 2 days later

    const args = { startDate, endDate, type: 'rfq' };
    const context = { user };

    const response = await graphqlRequest(qry, 'tendersTotalCount', args, context);

    expect(response).toBe(1);
  });

  test('tenders average duration', async () => {
    const qry = `
      query tendersAverageDuration(
        $startDate: Date!,
        $endDate: Date!
        $type: String!,
      ) {
        tendersAverageDuration(
          startDate: $startDate,
          endDate: $endDate,
          type: $type
        )
      }
    `;

    // below tender must be ignored by createdUser check
    const ignoredUser = await userFactory({});

    await tenderFactory({
      publishDate: moment(),
      closeDate: moment()
        .add(3, 'day')
        .endOf('day')
        .toDate(), // 3 days later
      type: 'rfq',
      createdUserId: ignoredUser._id,
    });

    const user = await userFactory({});

    await tenderFactory({
      publishDate: moment(),
      closeDate: moment()
        .add(3, 'day')
        .endOf('day')
        .toDate(), // 3 days later
      type: 'rfq',
      createdUserId: user._id,
    });

    await tenderFactory({
      publishDate: moment()
        .add(1, 'day')
        .endOf('day')
        .toDate(), // 1 days later
      closeDate: moment()
        .add(3, 'day')
        .endOf('day')
        .toDate(), // 3 days later
      type: 'rfq',
      createdUserId: user._id,
    });

    await tenderFactory({
      publishDate: moment()
        .add(1, 'day')
        .endOf('day')
        .toDate(), // 1 days later
      closeDate: moment()
        .add(10, 'day')
        .endOf('day')
        .toDate(), // 10 days later,
      type: 'eoi',
      createdUserId: user._id,
    });

    await tenderFactory({
      publishDate: moment()
        .add(3, 'day')
        .endOf('day')
        .toDate(), // 3 days later
      closeDate: moment()
        .add(20, 'day')
        .endOf('day')
        .toDate(), // 20 days later,
      type: 'eoi',
      createdUserId: user._id,
    });

    const startDate = moment().add(-1, 'day');
    const endDate = moment()
      .add(40, 'day')
      .endOf('day'); // 40 days later

    // ================ rfq
    let args = { startDate, endDate, type: 'rfq' };
    let response = await graphqlRequest(qry, 'tendersAverageDuration', args, { user });
    expect(response).toBe(2.5);

    // ================ eoi
    args = { startDate, endDate, type: 'eoi' };
    response = await graphqlRequest(qry, 'tendersAverageDuration', args, { user });
    expect(response).toBe(13);
  });

  test('tender response by user', async () => {
    const company = await companyFactory();
    const tender = await tenderFactory();

    user = await userFactory({ isSupplier: true, companyId: company._id });

    await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: company._id,
    });

    const response = await graphqlRequest(
      `query tenderResponseByUser($tenderId: String!) {
          tenderResponseByUser(tenderId: $tenderId) {
            _id
            tenderId
            supplierId

            supplier {
              _id
              basicInfo {
                enName
              }
            }
          }
        }
      `,
      'tenderResponseByUser',
      {
        tenderId: tender._id,
      },
      { user },
    );

    expect(response.tenderId).toBe(tender._id);
    expect(response.supplierId).toBe(company._id);
    expect(response.supplier._id).toBeDefined();
  });

  test('exclude not sent responses', async () => {
    const tender = await tenderFactory({});
    const user = await userFactory({ isSupplier: false });

    await tenderResponseFactory({ tenderId: tender._id, isSent: true });
    await tenderResponseFactory({ tenderId: tender._id });

    const response = await graphqlRequest(
      `query tenderDetail($_id: String!) {
          tenderDetail(_id: $_id) {
            _id
            responses {
              supplierId
            }
          }
        }
      `,
      'tenderDetail',
      { _id: tender._id },
      { user },
    );

    expect(response.responses.length).toBe(1);
  });

  test('tenders supplier', async () => {
    const user = await userFactory({ isSupplier: true });

    const supplierQuery = `
      query tendersSupplier(${commonParams}) {
          tendersSupplier(${commonValues}) {
            _id
            isParticipated
            isSent
          }
        }
      `;

    const supplierIds = [user.companyId];

    await tenderFactory({});
    await tenderFactory({ type: 'eoi', status: 'draft', supplierIds });
    await tenderFactory({ type: 'rfq', status: 'open', name: 'test', supplierIds });
    const tender = await tenderFactory({ type: 'eoi', status: 'open', supplierIds });

    await tenderResponseFactory({ tenderId: tender._id, supplierId: user.companyId });

    const doQuery = (args = {}) => graphqlRequest(supplierQuery, 'tendersSupplier', args, { user });

    // without any filter ==============
    // drafts must be excluded
    let response = await doQuery();

    expect(response.length).toBe(2);

    // by type ==============
    response = await doQuery({ type: 'rfq' });

    expect(response.length).toBe(1);

    // by type & name ==============
    response = await doQuery({ type: 'rfq', name: 'test' });

    // by particated status and type ==============
    response = await doQuery({ type: 'eoi', status: 'participated' });

    expect(response.length).toBe(1);
  });

  test('tender detail supplier', async () => {
    const user = await userFactory({ isSupplier: true });
    const tender = await tenderFactory({ supplierIds: ['_id', user.companyId] });

    const response = await graphqlRequest(
      `query tenderDetailSupplier($_id: String!) {
          tenderDetailSupplier(_id: $_id) {
            _id
            isSent
            isParticipated
          }
        }
      `,
      'tenderDetailSupplier',
      { _id: tender._id },
      { user },
    );

    expect(response.isParticipated).toBe(false);
    expect(response.isSent).toBe(false);
  });

  test('tender responses search & sort', async () => {
    const tender = await tenderFactory({});
    const user = await userFactory({ isSupplier: false });
    const supplier = await companyFactory({ enName: 'enName' });

    const tr1 = await tenderResponseFactory({
      tenderId: tender._id,
      supplierId: supplier._id,
      isSent: true,
      respondedProducts: [
        {
          code: 'code1',
          unitPrice: 300,
          totalPrice: 1000,
          leadTime: 2000,
        },
        {
          code: 'code2',
          unitPrice: 200,
          totalPrice: 2000,
          leadTime: 3000,
        },
      ],
    });

    const tr2 = await tenderResponseFactory({
      tenderId: tender._id,
      isSent: true,
      respondedProducts: [
        {
          code: 'code1',
          unitPrice: 200,
          totalPrice: 100,
          leadTime: 200,
        },
        {
          code: 'code2',
          unitPrice: 20,
          totalPrice: 200,
          leadTime: 300,
        },
      ],
    });

    const tr3 = await tenderResponseFactory({
      tenderId: tender._id,
      isSent: true,
      respondedProducts: [
        {
          code: 'code1',
          unitPrice: 100,
          totalPrice: 300,
          leadTime: 300,
        },
        {
          code: 'code2',
          unitPrice: 40,
          totalPrice: 500,
          leadTime: 80,
        },
      ],
    });

    const doQuery = (sort, betweenSearch, supplierSearch) =>
      graphqlRequest(
        `query tenderResponses(
          $tenderId: String!,
          $sort: JSON,
          $betweenSearch: JSON,
          $supplierSearch: String
        ) {
          tenderResponses(
            tenderId: $tenderId,
            sort: $sort,
            betweenSearch: $betweenSearch,
            supplierSearch: $supplierSearch
          ) {
            _id
          }
        }
      `,
        'tenderResponses',
        {
          tenderId: tender._id,
          sort,
          betweenSearch,
          supplierSearch,
        },
        { user },
      );

    // sort by minUnitPrice =============
    let response = await doQuery({
      name: 'minUnitPrice',
      productCode: 'code1',
    });

    expect(response.length).toBe(3);

    let [rr1, rr2, rr3] = response;

    expect(rr1._id).toBe(tr3._id);
    expect(rr2._id).toBe(tr2._id);
    expect(rr3._id).toBe(tr1._id);

    // sort by minLeadTime =============
    response = await doQuery({
      name: 'minLeadTime',
      productCode: 'code1',
    });

    [rr1, rr2, rr3] = response;

    expect(rr1._id).toBe(tr2._id);
    expect(rr2._id).toBe(tr3._id);
    expect(rr3._id).toBe(tr1._id);

    // sort by totalPrice =============
    response = await doQuery({
      name: 'minTotalPrice',
      productCode: 'code2',
    });

    [rr1, rr2, rr3] = response;

    expect(rr1._id).toBe(tr2._id);
    expect(rr2._id).toBe(tr3._id);
    expect(rr3._id).toBe(tr1._id);

    // search by between totalPrice =============
    response = await doQuery(
      {},
      {
        name: 'totalPrice',
        productCode: 'code2',
        minValue: 200,
        maxValue: 500,
      },
    );

    expect(response.length).toBe(2);

    // search by between unitPrice =============
    response = await doQuery(
      {},
      {
        name: 'unitPrice',
        productCode: 'code2',
        minValue: 0,
        maxValue: 30,
      },
    );

    expect(response.length).toBe(1);

    // search by between leadtime =============
    response = await doQuery(
      {},
      {
        name: 'leadTime',
        productCode: 'code2',
        minValue: 0,
        maxValue: 300,
      },
    );

    expect(response.length).toBe(2);

    // by supplier search =============
    response = await doQuery({}, {}, 'enName');

    expect(response.length).toBe(1);

    // by invalid product code =============
    response = await doQuery(
      {},
      {
        name: 'leadTime',
        productCode: 'code3',
        minValue: 0,
        maxValue: 300,
      },
    );

    expect(response.length).toBe(0);
  });
});
