import { Tenders, Companies } from '../../../db/models';
import utils from '../../../data/utils';
import { moduleRequireLogin } from '../../permissions';

const tenderMutations = {
  /**
   * Create new tender
   * @param {Object} doc - tenders fields
   * @return {Promise} newly created tender object
   */
  async tendersAdd(root, doc) {
    const tender = await Tenders.createTender(doc);

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
};

moduleRequireLogin(tenderMutations);

export default tenderMutations;
