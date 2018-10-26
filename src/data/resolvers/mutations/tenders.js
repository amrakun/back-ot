import { Tenders, TenderResponses, Companies } from '../../../db/models';
import {
  sendConfigEmail,
  sendEmailToBuyer,
  sendEmailToSuppliers,
  sendEmail,
} from '../../../data/tenderUtils';

import { moduleRequireBuyer } from '../../permissions';

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  tendersAdd(root, doc, { user }) {
    return Tenders.createTender(doc, user._id);
  },

  /**
   * Update tender
   * @param {String} _id - tenders id
   * @param {Object} fields - tenders fields
   * @return {Promise} updated tender object
   */
  tendersEdit(root, { _id, ...fields }) {
    return Tenders.updateTender(_id, fields);
  },

  /**
   * Delete tender
   * @param {String} doc - tenders fields
   * @return {Promise}
   */
  tendersRemove(root, { _id }) {
    return Tenders.removeTender(_id);
  },

  /**
   * Choose winners
   * @param {String} _id - Tender id
   * @param {String} supplierIds - Company ids
   * @return {Promise} - updated tender
   */
  async tendersAward(root, { _id, supplierIds }) {
    const tender = await Tenders.award(_id, supplierIds);

    await sendEmailToBuyer({ kind: 'buyer__award', tender });
    await sendEmailToSuppliers({ kind: 'supplier__award', tender, supplierIds });

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

      await sendConfigEmail({
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
  async tendersCancel(root, { _id }) {
    const tender = await Tenders.findOne({ _id });

    if (tender) {
      const canceledTender = await tender.cancel();

      await sendEmail({ kind: 'cancel', tender: canceledTender });

      return canceledTender;
    }

    return null;
  },
};

moduleRequireBuyer(tenderMutations);

export default tenderMutations;
