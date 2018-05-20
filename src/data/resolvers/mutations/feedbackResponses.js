import { Users, Companies, Feedbacks, FeedbackResponses } from '../../../db/models';
import { sendConfigEmail } from '../../../data/utils';
import { moduleRequireSupplier } from '../../permissions';

const feedbackResponseMutations = {
  /**
   * Create new feedbackResponse
   * @param {Object} doc - feedbackResponses fields
   * @return {Promise} newly created feedbackResponse object
   */
  async feedbackResponsesAdd(root, doc) {
    const response = await FeedbackResponses.createFeedbackResponse(doc);

    const supplier = await Companies.findOne({ _id: response.supplierId });
    const feedback = await Feedbacks.findOne({ _id: response.feedbackId });
    const createdUser = await Users.findOne({ _id: feedback.createdUserId });

    await sendConfigEmail({
      name: 'successFeedbackTemplates',
      kind: 'buyer__new',
      toEmails: [createdUser.email],
      replacer: text => {
        return text
          .replace('{supplier.name}', supplier.basicInfo.enName)
          .replace('{date}', response.createdDate);
      },
    });

    return response;
  },
};

moduleRequireSupplier(feedbackResponseMutations);

export default feedbackResponseMutations;
