/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { connect, disconnect } from '../db/connection';
import dbUtils from '../db/models/utils';
import { Configs, Audits, AuditResponses, Companies } from '../db/models';
import {
  configFactory,
  userFactory,
  auditFactory,
  companyFactory,
  auditResponseFactory,
  auditResponseDocs,
} from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Audit response db', () => {
  let _audit;
  let _company;

  beforeEach(async () => {
    // Creating test data

    _audit = await auditFactory();

    _company = await companyFactory({
      isSentRegistrationInfo: true,
      isSentPrequalificationInfo: true,
      isPrequalified: true,
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Configs.remove({});
    await Audits.remove({});
    await AuditResponses.remove({});
    await Companies.remove({});
  });

  test('Create audit', async () => {
    const user = await userFactory();
    const supplierIds = ['id1', 'id2'];

    const auditObj = await Audits.createAudit(
      {
        publishDate: new Date(),
        closeDate: new Date(),
        content: 'content',
        supplierIds,
      },
      user._id,
    );

    expect(auditObj.status).toBe('draft');
    expect(auditObj.createdDate).toBeDefined();
    expect(auditObj.createdUserId).toEqual(user._id);
    expect(auditObj.supplierIds).toContain('id1');
    expect(auditObj.supplierIds).toContain('id2');
  });

  test('Check deep update', async () => {
    await auditResponseFactory({
      auditId: _audit._id,
      supplierId: _company._id,
      coreHseqInfo: {
        doesHaveHealthSafety: {
          supplierComment: 'supplierComment',
          supplierAnswer: true,
        },
        doesHaveDocumentedPolicy: {
          supplierComment: 'supplierComment',
          supplierAnswer: false,
          auditorComment: 'auditorComment',
          auditorRecommendation: 'auditorRecommendation',
          auditorScore: true,
        },
      },
    });

    expect(await AuditResponses.find().count()).toBe(1);

    const updatedResponse = await AuditResponses.saveReplyRecommentSection({
      auditId: _audit._id,
      supplierId: _company._id,
      name: 'coreHseqInfo',
      doc: {
        doesHaveHealthSafety: {
          auditorComment: 'auditorComment',
          auditorRecommendation: 'auditorRecommendation',
          auditorScore: true,
        },
        doesHaveDocumentedPolicy: {
          supplierComment: 'supplierCommentUpdated',
          supplierAnswer: true,
        },
      },
    });

    expect(updatedResponse.isSent).toBe(false);
    expect(updatedResponse.sentDate).not.toBeDefined();

    // must not created new response
    expect(await AuditResponses.find().count()).toBe(1);

    const coreHseqInfo = JSON.parse(JSON.stringify(updatedResponse.coreHseqInfo));

    // doesHaveHealthSafety ========================
    // previous values must stay intact
    const doesHaveHealthSafety = coreHseqInfo.doesHaveHealthSafety;
    expect(doesHaveHealthSafety.supplierComment).toBe('supplierComment');
    expect(doesHaveHealthSafety.supplierAnswer).toBe(true);

    // new values must be setted
    expect(doesHaveHealthSafety.auditorComment).toBe('auditorComment');
    expect(doesHaveHealthSafety.auditorRecommendation).toBe('auditorRecommendation');
    expect(doesHaveHealthSafety.auditorScore).toBe(true);

    // doesHaveDocumentedPolicy ========================
    // previous values must stay intact
    const doesHaveDocumentedPolicy = coreHseqInfo.doesHaveDocumentedPolicy;

    expect(doesHaveDocumentedPolicy.auditorComment).toBe('auditorComment');
    expect(doesHaveDocumentedPolicy.auditorRecommendation).toBe('auditorRecommendation');
    expect(doesHaveDocumentedPolicy.auditorScore).toBe(true);

    // new values must be setted
    expect(doesHaveDocumentedPolicy.supplierComment).toBe('supplierCommentUpdated');
    expect(doesHaveDocumentedPolicy.supplierAnswer).toBe(true);
  });

  // common helper
  const checkCommonReplyRecommentSection = async name => {
    const doc = auditResponseDocs[name]();

    const updatedResponse = await AuditResponses.saveReplyRecommentSection({
      auditId: _audit._id,
      supplierId: _company._id,
      name,
      doc,
    });

    const updatedSupplier = await Companies.findOne({ _id: _company._id });

    expect(updatedSupplier.isQualified).not.toBe(true);

    const sectionValue = JSON.parse(JSON.stringify(updatedResponse[name]));

    expect(sectionValue).toEqual(doc);
  };

  test('Check supplier validations', async () => {
    expect.assertions(3);

    const company = await companyFactory({
      isSentRegistrationInfo: false,
      isSentPrequalificationInfo: false,
    });

    const modifier = {
      auditId: _audit._id,
      supplierId: company._id,
      name: 'coreHseqInfo',
      doc: auditResponseDocs.coreHseqInfo(),
    };

    // registration info ==========
    try {
      await AuditResponses.saveReplyRecommentSection(modifier);
    } catch (e) {
      expect(e.message).toBe('Registration stage is not complete');
    }

    // prequalification info ==========
    await Companies.update({ _id: company._id }, { $set: { isSentRegistrationInfo: true } });

    try {
      await AuditResponses.saveReplyRecommentSection(modifier);
    } catch (e) {
      expect(e.message).toBe('Prequalification stage is not complete');
    }

    // isPrequalified
    await Companies.update({ _id: company._id }, { $set: { isSentPrequalificationInfo: true } });

    try {
      await AuditResponses.saveReplyRecommentSection(modifier);
    } catch (e) {
      expect(e.message).toBe('Not prequalified');
    }
  });

  test('Basic info', async () => {
    expect.assertions(3);

    const doc = {
      sotri: 'sotri',
      sotie: 'sotie',
      otExperience: 'otExperience',
    };

    const response = await AuditResponses.saveBasicInfo({
      auditId: _audit._id,
      supplierId: _company._id,
      doc,
    });

    expect(response.createdDate).toBeDefined();
    expect(response.basicInfo.toJSON()).toEqual(doc);

    // check isEditable validation
    await AuditResponses.update({ _id: response._id }, { $set: { isEditable: false } });

    try {
      await AuditResponses.saveBasicInfo({
        auditId: _audit._id,
        supplierId: _company._id,
        doc,
      });
    } catch (e) {
      expect(e.message).toBe('Not editable');
    }
  });

  test('Core HSEQ info', async () => {
    await checkCommonReplyRecommentSection('coreHseqInfo');
  });

  test('Human resource management info', async () => {
    await checkCommonReplyRecommentSection('hrInfo');
  });

  test('Business integrity info', async () => {
    await checkCommonReplyRecommentSection('businessInfo');
  });

  test('Business integrity info', async () => {
    await checkCommonReplyRecommentSection('businessInfo');
  });

  test('Publish drafts', async () => {
    // mocking datetime now
    dbUtils.getNow = jest.fn(() => new Date('2040-02-01 01:01'));

    let audit1 = await auditFactory({ publishDate: new Date('2040-02-01 01:00') });
    let audit2 = await auditFactory({ publishDate: new Date('2040-02-02') });

    await Audits.publishDrafts();

    audit1 = await Audits.findOne({ _id: audit1._id });
    audit2 = await Audits.findOne({ _id: audit2._id });

    expect(audit1.status).toBe('open');
    expect(audit2.status).toBe('draft');
  });

  test('Close opens', async () => {
    // mocking datetime now
    dbUtils.getNow = jest.fn(() => new Date('2018/01/20 17:11'));

    let audit1 = await auditFactory({ status: 'open', closeDate: new Date('2018/01/20 17:10') });
    let audit2 = await auditFactory({ status: 'open', closeDate: new Date('2018/01/20 17:12') });

    await Audits.closeOpens();

    audit1 = await Audits.findOne({ _id: audit1._id });
    audit2 = await Audits.findOne({ _id: audit2._id });

    expect(audit1.status).toBe('closed');
    expect(audit2.status).toBe('open');
  });

  test('Send', async () => {
    expect.assertions(6);

    const audit = await auditFactory({ status: 'open' });

    let auditResponse = await auditResponseFactory({
      auditId: audit._id,
      isEditable: true,
    });

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(false);

    await auditResponse.send();

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(true);
    expect(auditResponse.notificationForBuyer).toBe('sent');
    expect(auditResponse.sentDate).toBeDefined();
    expect(auditResponse.submittedCount).toBe(1);
    expect(auditResponse.status).toBe('onTime');
  });

  test('Send: late', async () => {
    const audit = await auditFactory({ status: 'closed' });

    let auditResponse = await auditResponseFactory({
      auditId: audit._id,
      isEditable: true,
      isSentResubmitRequest: true,
    });

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(false);

    await auditResponse.send();

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(true);
    expect(auditResponse.status).toBe('late');
  });

  test('Send files', async () => {
    let auditResponse = await auditResponseFactory({});

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    const doc = {
      improvementPlan: true,
      report: false,
    };

    await auditResponse.sendFiles(doc);

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.improvementPlanSentDate).toBeDefined();
    expect(auditResponse.reportSentDate).not.toBeDefined();
  });

  test('Get last audit', async () => {
    const supplier = await companyFactory({});
    const supplierId = supplier._id;

    await auditFactory({ supplierIds: [supplierId] });
    await auditFactory({ supplierIds: [supplierId] });
    const expectedlastAudit = await auditFactory({ supplierIds: [supplierId] });

    const lastAudit = await Audits.getLastAudit(supplierId);

    expect(expectedlastAudit._id.toString()).toBe(lastAudit._id.toString());
  });

  test('Qualified status', async () => {
    await AuditResponses.saveReplyRecommentSection({
      auditId: _audit._id,
      supplierId: _company._id,
      name: 'coreHseqInfo',
      doc: auditResponseDocs.coreHseqInfo(),
    });

    await AuditResponses.saveReplyRecommentSection({
      auditId: _audit._id,
      supplierId: _company._id,
      name: 'businessInfo',
      doc: auditResponseDocs.businessInfo(),
    });

    await AuditResponses.saveReplyRecommentSection({
      auditId: _audit._id,
      supplierId: _company._id,
      name: 'hrInfo',
      doc: auditResponseDocs.hrInfo(),
    });

    const supplier = await Companies.findOne({ _id: _company._id });

    const response = await AuditResponses.findOne({
      auditId: _audit._id,
      supplierId: _company._id,
    });

    expect(supplier.isQualified).toBe(true);
    expect(response.isQualified).toBe(true);
  });

  test('reset qualification status', async () => {
    const check = async duration => {
      await Configs.remove({});

      await configFactory({
        auditDow: {
          duration,
          amount: 2,
        },
      });

      // ignore not qualified suppliers ============
      const supplier = await companyFactory({ isQualified: false });

      let response = await AuditResponses.resetQualification(supplier._id);

      expect(response).toBe('notQualified');

      // due date is not here ============
      await Companies.update(
        { _id: supplier._id },
        {
          isQualified: true,
          qualifiedDate: new Date(),
        },
      );

      response = await AuditResponses.resetQualification(supplier._id);

      expect(response).toBe('dueDateIsNotHere');

      // due date is here ============
      await Companies.update(
        { _id: supplier._id },
        {
          qualifiedDate: moment().subtract(3, `${duration}s`),
        },
      );

      response = await AuditResponses.resetQualification(supplier._id);

      expect(response.isQualified).toBe(false);
    };

    await check('year');
    await check('month');
    await check('day');
  });

  test('reset qualification status: specific', async () => {
    const supplier = await companyFactory({
      isQualified: true,
      qualifiedDate: moment().subtract(3, 'years'),
    });

    await configFactory({
      specificAuditDow: {
        supplierIds: [supplier._id],
        duration: 'year',
        amount: 2,
      },
    });

    const response = await AuditResponses.resetQualification(supplier._id);

    expect(response.isQualified).toBe(false);
  });

  test('notify improvement plan', async () => {
    await Configs.remove({});

    // not configured ================
    const supplier = await companyFactory({ tierType: 'national' });

    let response = await auditResponseFactory({
      supplierId: supplier._id,
      improvementPlanSentDate: moment().subtract(4, 'days'),
      isEditable: false,
    });

    const result = await AuditResponses.notifyImprovementPlan(response._id);

    expect(result).toBe('notConfigured');

    // configfured && 14 days is not reached ========================
    await Configs.update(
      {},
      {
        $set: {
          specificImprovementPlanDow: {
            supplierIds: [supplier._id],
            national: {
              duration: 'day',
              amount: 20,
            },
          },
        },
      },
    );

    await AuditResponses.notifyImprovementPlan(response._id);

    response = await AuditResponses.findOne({ _id: response._id });

    expect(response.isEditable).toBe(false);

    // 14 days is reached ========================
    await AuditResponses.update(
      { _id: response._id },
      { $set: { improvementPlanSentDate: moment().subtract(5, 'days') } },
    );

    await AuditResponses.notifyImprovementPlan(response._id);

    response = await AuditResponses.findOne({ _id: response._id });

    expect(response.isEditable).toBe(true);
    expect(response.notificationForSupplier).toBe('improvementPlanDueDate');
  });
});
