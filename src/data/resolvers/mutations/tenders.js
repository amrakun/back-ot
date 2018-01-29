import { Tenders, TenderResponses, Companies } from '../../../db/models';
import utils from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  async tendersAdd(root, doc, { user }) {
    const tender = await Tenders.createTender(doc, user._id);

    // send email ==============
    for (let supplierId of tender.supplierIds) {
      const supplier = await Companies.findOne({ _id: supplierId });

      utils.sendEmail({
        toEmails: [supplier.basicInfo.email],
        title: tender.name,
        template: {
          name: 'tender',
          data: {
            content: tender.content,
          },
        },
      });
    }

    return tender;
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
   * Choose winner
   * @param {String} _id - Tender id
   * @param {String} supplierId - Company id
   * @return {Promise} - updated tender
   */
  tendersAward(root, { _id, supplierId }) {
    return Tenders.award(_id, supplierId);
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
      supplierId: { $ne: tender.winnerId },
    });

    // send emai to not awarded suppliers
    for (let notAwardedResponse of notAwardedResponses) {
      const supplier = (await Companies.findOne({ _id: notAwardedResponse.supplierId })) || {};
      const basicInfo = supplier.basicInfo || {};

      utils.sendEmail({
        toEmails: [basicInfo.email],
        title: subject,
        template: {
          name: 'regretLetter',
          data: { content },
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
      return tender.cancel();
    }

    return null;
  },
};

moduleRequireBuyer(tenderMutations);

export default tenderMutations;
