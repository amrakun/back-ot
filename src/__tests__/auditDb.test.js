/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import dbUtils from '../db/models/utils';
import { Audits, AuditResponses, Companies } from '../db/models';
import {
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
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
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
        supplierIds,
      },
      user._id,
    );

    expect(auditObj.status).toBe('draft');
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

    const sectionValue = JSON.parse(JSON.stringify(updatedResponse[name]));

    expect(sectionValue).toEqual(doc);
  };

  test('Basic info', async () => {
    const doc = {
      sotri: 'sotri',
      sotie: 'sotie',
    };

    const updatedResponse = await AuditResponses.saveBasicInfo({
      auditId: _audit._id,
      supplierId: _company._id,
      doc,
    });

    expect(updatedResponse.basicInfo.toJSON()).toEqual(doc);
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

  test('Evidence info', async () => {
    const doc = auditResponseDocs.evidenceInfo();

    const updatedResponse = await AuditResponses.saveEvidenceInfo({
      auditId: _audit._id,
      supplierId: _company._id,
      doc,
    });

    expect(updatedResponse.evidenceInfo.toJSON()).toEqual(doc);
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
    expect.assertions(4);

    const audit = await auditFactory({ status: 'open' });

    let auditResponse = await auditResponseFactory({
      auditId: audit._id,
    });

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(false);

    await auditResponse.send();

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(true);
    expect(auditResponse.status).toBe('onTime');

    // try to resend
    try {
      await auditResponse.send();
    } catch (e) {
      expect(e.message).toBe('Already sent');
    }
  });

  test('Send: late', async () => {
    const audit = await auditFactory({ status: 'closed' });

    let auditResponse = await auditResponseFactory({
      auditId: audit._id,
    });

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(false);

    await auditResponse.send();

    auditResponse = await AuditResponses.findOne({ _id: auditResponse._id });

    expect(auditResponse.isSent).toBe(true);
    expect(auditResponse.status).toBe('late');
  });
});
