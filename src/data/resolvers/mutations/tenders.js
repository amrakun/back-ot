import moment from 'moment';

import { Tenders, TenderResponses, Companies, TenderLogs } from '../../../db/models';
import tenderUtils from '../../../data/tenderUtils';
import { readS3File, putCreateLog, putUpdateLog } from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';

/**
 * Excludes encrypted tender fields from objects
 * @param {Object} dbRow Actual tender row in db
 * @param {Object} doc Tender doc to be added or changed
 */
const excludeEncryptedFields = (dbRow, doc) => {
  // exclude these fields in log
  const encryptedFieldNames = [
    'name',
    'number',
    'supplierIds',
    'winnerIds',
    'bidderListedSupplierIds',
  ];
  const oldTender = { ...dbRow };
  const logObject = { ...doc };

  for (const field of encryptedFieldNames) {
    if (oldTender[field]) {
      delete oldTender[field];
    }
    if (logObject[field]) {
      delete logObject[field];
    }
  }

  return {
    row: oldTender,
    doc: logObject,
  };
};

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  async tendersAdd(root, doc, { user }) {
    const tender = await Tenders.createTender(doc, user._id);

    // create log
    await TenderLogs.write({
      tenderId: tender._id,
      userId: user._id,
      action: 'create',
      description: 'Created',
    });

    const excluded = excludeEncryptedFields(tender, doc);

    await putCreateLog(
      {
        type: 'tender',
        newData: JSON.stringify(excluded.doc),
        object: excluded.doc,
        description: `Tender "${tender.name}" has been created`,
      },
      user,
    );

    return tender;
  },

  /**
   * Update tender
   * @param {String} _id - tenders id
   * @param {Object} fields - tenders fields
   * @return {Promise} updated tender object
   */
  async tendersEdit(root, { _id, ...fields }, { user }) {
    const oldTender = await Tenders.findById(_id);
    const oldSupplierIds = await oldTender.getExactSupplierIds();
    const updatedTender = await Tenders.updateTender(_id, { ...fields }, user._id);

    // write edit log
    await TenderLogs.write({
      tenderId: oldTender._id,
      userId: user._id,
      action: 'edit',
      description: 'Edited',
    });

    const excluded = excludeEncryptedFields(oldTender, fields);

    await putUpdateLog(
      {
        type: 'tender',
        object: excluded.row,
        newData: JSON.stringify(excluded.doc),
        description: `Tender "${oldTender.name}" has been edited`,
      },
      user,
    );

    if (moment(oldTender.closeDate).isBefore(updatedTender.closeDate)) {
      // write extended log
      await TenderLogs.write({
        tenderId: oldTender._id,
        userId: user._id,
        action: 'extend',
        description: `Extended close date from (${oldTender.closeDate}) to (${
          updatedTender.closeDate
        })`,
      });
    }

    if (oldTender.status === 'open') {
      const newSupplierIds = await oldTender.getNewSupplierIds(fields);

      // send publish emails to new suppliers
      await tenderUtils.sendEmailToSuppliers({
        kind: 'supplier__publish',
        tender: updatedTender,
        attachments: await tenderUtils.getAttachments(updatedTender),
        supplierIds: newSupplierIds,
      });

      // if tender is changed than send edit email to old suppliers
      if (await oldTender.isChanged(fields)) {
        await tenderUtils.sendEmailToSuppliers({
          kind: 'supplier__edit',
          tender: updatedTender,
          attachments: await tenderUtils.getAttachments(updatedTender),
          supplierIds: oldSupplierIds,
        });
      }
    }

    if (['closed', 'canceled'].includes(oldTender.status)) {
      // write reopen log
      await TenderLogs.write({
        tenderId: oldTender._id,
        userId: user._id,
        action: 'reopen',
        description: 'Reopened',
      });

      const updatedTenderIds = new Set(await updatedTender.getExactSupplierIds());
      const intersectionIds = oldSupplierIds.filter(x => updatedTenderIds.has(x));

      await tenderUtils.sendEmailToSuppliers({
        kind: 'supplier__reopen',
        tender: updatedTender,
        supplierIds: intersectionIds,
      });
    }

    return updatedTender;
  },

  /**
   * Choose winners
   * @param {String} _id - Tender id
   * @param {String} supplierIds - Company ids
   * @return {Promise} - updated tender
   */
  async tendersAward(root, { _id, supplierIds, note, attachments }, { user }) {
    const oldTender = await Tenders.findOne({ _id });
    const tender = await Tenders.award({ _id, supplierIds, note, attachments }, user._id);

    // write awarded log
    await TenderLogs.write({
      tenderId: _id,
      userId: user._id,
      action: 'award',
      description: 'Awarded',
    });

    await tenderUtils.sendEmailToBuyer({ kind: 'buyer__award', tender });

    const suppliers = await Companies.find({ _id: { $in: supplierIds } });

    // Send email with corresponding attachment to ever supplier
    for (const supplier of suppliers) {
      const attachmentBySupplier = (attachments || []).find(
        a => a.supplierId === supplier._id.toString(),
      );

      if (!attachmentBySupplier) {
        continue;
      }

      const { attachment } = attachmentBySupplier;

      const file = await readS3File(attachment.url, user);

      await tenderUtils.sendConfigEmail({
        kind: 'supplier__award',
        tender,
        toEmails: [supplier.basicInfo.email],
        attachments: [
          {
            filename: attachment.name,
            content: file.Body,
          },
        ],
      });
    } // end supplier for loop

    // explicitly omitted supplierIds for security reason
    const oldTenderInfo = {
      _id,
      awardNote: oldTender.awardNote,
      awardAttachments: oldTender.awardAttachments,
    };
    const changeDoc = {
      awardNote: note,
      awardAttachments: attachments,
    };

    await putUpdateLog(
      {
        type: 'tender',
        object: oldTenderInfo,
        newData: JSON.stringify(changeDoc),
        description: `Tender "${oldTender.name}" has been awarded to suppliers`,
      },
      user,
    );

    return tender;
  },

  /**
   * Send regret email
   * @param {String} _id - Tender id
   * @param {String} subject - Mail subject
   * @param {String} content - Mail content
   * @return {[String]} - send supplier ids
   */
  async tendersSendRegretLetter(root, { _id, subject, content }, { user }) {
    const tender = await Tenders.findOne({ _id });

    await tender.sendRegretLetter();

    // rfq
    const notChosenResponses = await TenderResponses.find({
      tenderId: _id,
      supplierId: { $nin: tender.winnerIds },
    });

    let notChosenSuppliers = await Companies.find({
      _id: { $in: notChosenResponses.map(r => r.supplierId) },
    });

    // eoi
    if (tender.type === 'eoi') {
      notChosenSuppliers = await tender.getNotBidderListedSuppliers();
    }

    // send email to not chosen suppliers
    for (let supplier of notChosenSuppliers) {
      await tenderUtils.sendConfigEmail({
        name: `${tender.type}Templates`,
        kind: 'supplier__regretLetter',
        tender,
        toEmails: [supplier.basicInfo.email],
        replacer: text => {
          return text.replace('{content}', content).replace('{subject}', subject);
        },
      });
    }

    await putUpdateLog(
      {
        type: 'tender',
        object: tender,
        newData: JSON.stringify({ sendRegretLetter: true }),
        description: `Regret letters have been sent on tender "${tender.name}"`,
      },
      user,
    );

    return notChosenSuppliers.map(response => response._id);
  },

  /**
   * Mark tender as canceled
   * @param {String} _id - Tender id
   * @return {Promise} - updated tender
   */
  async tendersCancel(root, { _id, reason }, { user }) {
    const tender = await Tenders.findOne({ _id });

    if (tender) {
      const canceledTender = await tender.cancel(user._id, reason);

      // write canceled log
      await TenderLogs.write({
        tenderId: tender._id,
        userId: user._id,
        action: 'cancel',
        description: `Canceled`,
      });

      const supplierIds = await tender.participatedSuppliers({ onlyIds: true });

      // send canceled emails to participated suppliers
      await tenderUtils.sendEmailToSuppliers({
        kind: 'supplier__cancel',
        tender: canceledTender,
        supplierIds,
      });

      await tenderUtils.sendEmailToBuyer({ kind: 'buyer__cancel', tender: canceledTender });

      // Makes change with this in model helper
      const cancelDoc = {
        status: 'canceled',
        cancelReason: reason,
      };

      await putUpdateLog(
        {
          type: 'tender',
          object: tender,
          newData: JSON.stringify(cancelDoc),
          description: `Tender "${tender.name}" has been canceled`,
        },
        user,
      );

      return canceledTender;
    }

    return null;
  },
};

moduleRequireBuyer(tenderMutations);

export default tenderMutations;
