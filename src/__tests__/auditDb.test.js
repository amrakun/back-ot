/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
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
    const auditObj = await Audits.createAudit({ supplierIds }, user._id);

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
});
