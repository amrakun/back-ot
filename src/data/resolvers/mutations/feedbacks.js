import { Companies, Feedbacks } from '../../../db/models';
import { sendConfigEmail } from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';

const feedbackMutations = {
  /**
   * Create new feedback
   * @param {Object} doc - feedbacks fields
   * @return {Promise} newly created feedback object
   */
  async feedbacksAdd(root, doc, { user }) {
    const feedback = await Feedbacks.createFeedback(doc, user._id);
    const suppliers = await Companies.find({ _id: { $in: doc.supplierIds } });

    for (const supplier of suppliers) {
      await sendConfigEmail({
        name: 'successFeedbackTemplates',
        kind: 'supplier__new',
        toEmails: [supplier.basicInfo.email],
      });
    }

    return feedback;
  },
};

moduleRequireBuyer(feedbackMutations);

export default feedbackMutations;
