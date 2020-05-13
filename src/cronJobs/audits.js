import schedule from 'node-schedule';
import { Companies, Audits, AuditResponses } from '../db/models';
import { sendEmail } from '../data/auditUtils';

// every 1 minute
schedule.scheduleJob('*/1 * * * *', async () => {
  const { MAIN_AUDITOR_EMAIL } = process.env;

  const publishedAuditIds = await Audits.publishDrafts();
  const publishedAudits = await Audits.find({ _id: { $in: publishedAuditIds } });

  // make responses editable
  await AuditResponses.updateMany(
    { auditId: { $in: publishedAuditIds } },
    { $set: { isEditable: true } },
  );

  // send published email to suppliers
  for (const audit of publishedAudits) {
    for (const supplierId of audit.supplierIds) {
      const supplier = await Companies.findOne({ _id: supplierId });

      await sendEmail({
        kind: 'supplier__invitation',
        toEmails: [supplier.basicInfo.email],
        audit,
        supplier,
      });
    }

    await sendEmail({
      kind: 'buyer__invitation',
      toEmails: [MAIN_AUDITOR_EMAIL],
      audit,
    });
  }

  // close open audits ===========
  const closedAuditIds = await Audits.closeOpens();
  const closedAudits = await Audits.find({ _id: { $in: closedAuditIds } });

  for (const audit of closedAudits) {
    const responses = await AuditResponses.find({ auditId: audit._id });

    for (const response of responses) {
      const supplier = await Companies.findOne({ _id: response.supplierId });

      try {
        await sendEmail({
          kind: 'supplier__close',
          toEmails: [supplier.basicInfo.email],
          audit,
          supplier,
        });
      } catch (e) {
        console.log(e.message);
      }
    }

    try {
      await sendEmail({
        kind: 'buyer__close',
        toEmails: [MAIN_AUDITOR_EMAIL],
        audit,
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  await AuditResponses.disableEditabledResponses();

  console.log('Checked audit status'); // eslint-disable-line

  // send reminder ================
  const responsesToRemind = await AuditResponses.responsesToRemind();

  for (const response of responsesToRemind) {
    const audit = await Audits.findOne({ _id: response.auditId });
    const supplier = await Companies.findOne({ _id: response.supplierId });

    try {
      await sendEmail({
        kind: response.reassessmentDate
          ? 'supplier__due_reassessmentDate'
          : 'supplier__due_closeDate',
        toEmails: [supplier.basicInfo.email],
        audit,
        supplier,
      });
    } catch (e) {
      console.log(e.message);
    }
  }
});

// every day at 23 45
schedule.scheduleJob('0 45 23 * * *', async () => {
  // check improvement date due date
  const responses = await AuditResponses.find({ isQualified: { $ne: true } });

  for (const response of responses) {
    await AuditResponses.notifyImprovementPlan(response._id);
  }

  console.log('Checked improvement plan notification'); // eslint-disable-line
});
