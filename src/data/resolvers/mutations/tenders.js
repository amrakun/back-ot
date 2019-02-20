import { Tenders, TenderResponses, Companies, TenderLog } from '../../../db/models';
import moment from 'moment';

import { Tenders, TenderResponses, Companies } from '../../../db/models';
import tenderUtils from '../../../data/tenderUtils';
import { readS3File } from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  async tendersAdd(root, doc, { user }) {
    const tender = await Tenders.createTender(doc, user._id);

    await TenderLog.write({
      tenderId: tender._id.toString(),
      userId: user._id.toString(),
      action: 'create',
      description: `Created a ${tender.getLabelOfType()} draft ${tender.number}.`,
    });

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

    await TenderLog.write({
      tenderId: oldTender._id.toString(),
      userId: user._id.toString(),
      action: 'edit',
      description: `Edited a ${oldTender.status} ${
        oldTender.number
      } ${oldTender.getLabelOfType()}.`,
    });

    if (moment(oldTender.closeDate).isBefore(updatedTender.closeDate)) {
      await TenderLog.write({
        tenderId: oldTender._id.toString(),
        userId: user._id.toString(),
        action: 'extend',
        description: `Extended a ${oldTender.getLabelOfType()}'s close date from (${
          oldTender.closeDate
        }) to (${updatedTender.closeDate})`,
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
      await TenderLog.write({
        tenderId: oldTender._id.toString(),
        userId: user._id.toString(),
        action: 'reopen',
        description: `Reopened a ${oldTender.status} ${oldTender.getLabelOfType()} ${
          oldTender.number
        } ${oldTender.getLabelOfType()}.`,
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
    const tender = await Tenders.award({ _id, supplierIds, note, attachments }, user._id);

    await TenderLog.write({
      tenderId: _id.toString(),
      userId: user._id.toString(),
      action: 'award',
      description: `Awarded a ${tender.getLabelOfType()}`,
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
    }

    return tender;
  },

  /**
   * Send regret email
   * @param {String} _id - Tender id
   * @param {String} subject - Mail subject
   * @param {String} content - Mail content
   * @return {[String]} - send supplier ids
   */
  async tendersSendRegretLetter(root, { _id, subject, content }) {
    const tender = await Tenders.findOne({ _id });

    await tender.sendRegretLetter();

    const notAwardedResponses = await TenderResponses.find({
      tenderId: _id,
      supplierId: { $nin: tender.winnerIds },
    });

    // send email to not awarded suppliers
    for (let notAwardedResponse of notAwardedResponses) {
      const selector = { _id: notAwardedResponse.supplierId };
      const supplier = (await Companies.findOne(selector)) || {};

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

    return notAwardedResponses.map(response => response.supplierId);
  },

  /**
   * Mark tender as canceled
   * @param {String} _id - Tender id
   * @return {Promise} - updated tender
   */
  async tendersCancel(root, { _id }, { user }) {
    const tender = await Tenders.findOne({ _id });

    if (tender) {
      const canceledTender = await tender.cancel(user._id);

      await TenderLog.write({
        tenderId: tender._id.toString(),
        userId: user._id.toString(),
        action: 'cancel',
        description: `Canceled a ${tender.getLabelOfType()} ${canceledTender.number}`,
      });

      await tenderUtils.sendEmail({ kind: 'cancel', tender: canceledTender });

      return canceledTender;
    }

    return null;
  },
};

moduleRequireBuyer(tenderMutations);

export default tenderMutations;
