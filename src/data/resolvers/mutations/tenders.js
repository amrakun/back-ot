import moment from 'moment';
import { _ } from 'underscore';

import { Tenders, Companies, TenderLogs } from '../../../db/models';
import { decryptArray } from '../../../db/models/utils';
import tenderUtils from '../../../data/tenderUtils';
import { readS3File, putCreateLog, putUpdateLog } from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';
import { LOG_TYPES } from '../../constants';

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  async tendersAdd(root, doc, { user }) {
    const tender = await Tenders.createTender(doc, user._id);
    // for showing company name in log list
    const supplierNames = await tenderUtils.gatherSupplierNames(doc.supplierIds, 'supplierIds');
    const userNames = await tenderUtils.gatherUserNames(doc.responsibleBuyerIds);

    // create log
    await TenderLogs.write({
      tenderId: tender._id,
      userId: user._id,
      action: 'create',
      description: 'Created',
    });

    putCreateLog(
      {
        type: LOG_TYPES.TENDER,
        object: tender.toObject(),
        newData: JSON.stringify({
          ...doc,
          createdUserId: user._id,
          status: 'draft',
          createdDate: new Date(),
          updatedDate: new Date(),
        }),
        description: `Tender "${
          tender.name
        }" of type "${tender.type.toUpperCase()}" has been created`,
        extraDesc: JSON.stringify([
          ...supplierNames,
          ...userNames,
          { createdUserId: user._id, name: user.username },
        ]),
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
    const oldTender = await Tenders.findOne({ _id });
    const oldSupplierIds = await oldTender.getExactSupplierIds();
    const oldSupplierNames = await tenderUtils.gatherSupplierNames(oldSupplierIds, 'supplierIds');

    // mongoose validator skips checking when undefined value comes
    if (!fields.file) {
      fields.file = null;
    }

    const updatedTender = await Tenders.updateTender(_id, { ...fields }, user._id);
    const updatedSupplierIds = await updatedTender.getExactSupplierIds();
    const updatedSupplierNames = await tenderUtils.gatherSupplierNames(
      updatedSupplierIds,
      'supplierIds',
    );
    const userNames = await tenderUtils.gatherUserNames(fields.responsibleBuyerIds);

    // prevent from saving duplicate names
    let supplierNames = [];

    supplierNames = oldSupplierNames.concat(updatedSupplierNames);
    supplierNames = _.uniq(supplierNames, false, item => item.supplierIds);

    // write edit log
    await TenderLogs.write({
      tenderId: oldTender._id,
      userId: user._id,
      action: 'edit',
      description: 'Edited',
    });

    let description = `Tender "${
      oldTender.name
    }" of type "${oldTender.type.toUpperCase()}" has been`;

    if (oldTender.status === 'closed' && fields.status !== 'closed') {
      description = `${description} re-opened`;
    } else {
      description = `${description} edited`;
    }

    /**
     * Exact supplier ids needed for comparison since it encrypts it every update
     * action & becomes uncomparable to old supplier ids.
     */
    putUpdateLog(
      {
        type: LOG_TYPES.TENDER,
        object: { ...oldTender.toObject(), supplierIds: oldSupplierIds },
        newData: JSON.stringify({
          ...fields,
          updatedDate: updatedTender.updatedDate,
          status: updatedTender.status,
          supplierIds: updatedSupplierIds,
        }),
        description,
        extraDesc: JSON.stringify([
          ...supplierNames,
          ...userNames,
          { createdUserId: user._id, name: user.username },
        ]),
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
    const supplierNames = await tenderUtils.gatherSupplierNames(supplierIds, 'winnerIds');

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

      let perAttachments = [];

      if (attachmentBySupplier) {
        const { attachment } = attachmentBySupplier;
        const file = await readS3File(attachment.url, user);

        perAttachments = [
          {
            filename: attachment.name,
            content: file.Body,
          },
        ];
      }

      await tenderUtils.sendConfigEmail({
        kind: 'supplier__award',
        tender,
        toEmails: [supplier.basicInfo.email],
        attachments: perAttachments,
      });
    } // end supplier for loop

    // decrypt winnerIds for exact comparison
    const oldTenderInfo = {
      _id,
      awardNote: oldTender.awardNote,
      awardAttachments: oldTender.awardAttachments,
      winnerIds: decryptArray(oldTender.winnerIds || []),
    };

    const changeDoc = {
      awardNote: note,
      awardAttachments: attachments,
      winnerIds: supplierIds,
    };

    putUpdateLog(
      {
        type: LOG_TYPES.TENDER,
        object: oldTenderInfo,
        newData: JSON.stringify(changeDoc),
        description: `Tender "${
          oldTender.name
        }" of type "${oldTender.type.toUpperCase()}" has been awarded to suppliers`,
        extraDesc: JSON.stringify(supplierNames),
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

    let notChosenSuppliers = await tender.getRfqNotChosenSuppliers();

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

    putUpdateLog(
      {
        type: LOG_TYPES.TENDER,
        object: tender,
        newData: JSON.stringify({ sendRegretLetter: true }),
        description: `Regret letters have been sent on tender "${
          tender.name
        }"of type "${tender.type.toUpperCase()}"`,
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

      putUpdateLog(
        {
          type: LOG_TYPES.TENDER,
          object: tender,
          newData: JSON.stringify(cancelDoc),
          description: `Tender "${
            tender.name
          }" of type "${tender.type.toUpperCase()}" has been canceled`,
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
