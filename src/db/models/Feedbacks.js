import mongoose from 'mongoose';
import { field } from './utils';

// Feedback schema
const FeedbackSchema = mongoose.Schema({
  status: field({ type: String }),
  closeDate: field({ type: Date }),
  supplierIds: field({ type: [String] }),
  content: field({ type: String }),

  createdDate: field({ type: Date }),
  createdUserId: field({ type: String }),
});

class Feedback {
  /**
   * Create new feedback
   * @param {Object} doc - feedback fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created feedback object
   */
  static createFeedback(doc, userId) {
    return this.create({
      ...doc,
      status: 'open',
      createdDate: new Date(),
      createdUserId: userId,
    });
  }
}

FeedbackSchema.loadClass(Feedback);

const Feedbacks = mongoose.model('feedbacks', FeedbackSchema);

const FeedbackResponseSchema = mongoose.Schema({
  feedbackId: field({ type: String }),
  supplierId: field({ type: String }),

  status: field({ type: String }),

  employmentNumberBefore: field({ type: Number }),
  employmentNumberNow: field({ type: Number }),

  nationalSpendBefore: field({ type: Number }),
  nationalSpendAfter: field({ type: Number }),

  umnugobiSpendBefore: field({ type: Number }),
  umnugobiSpendAfter: field({ type: Number }),

  investment: field({ type: String }),
  trainings: field({ type: String }),
  corporateSocial: field({ type: String }),
  technologyImprovement: field({ type: String }),
});

class FeedbackResponse {
  /**
   * Create new feedback response
   * @param {Object} doc - feedback response fields
   * @return {Promise} newly created feedback response object
   */
  static async createFeedbackResponse(doc) {
    const { feedbackId, supplierId } = doc;

    // prevent duplications
    if (await this.findOne({ feedbackId, supplierId })) {
      throw new Error('Already sent');
    }

    const feedback = await Feedbacks.findOne({ _id: feedbackId });

    doc.status = 'onTime';

    // if closeDate is reached, mark status as late
    if (feedback.status === 'closed') {
      doc.status = 'late';
    }

    return this.create(doc);
  }
}

FeedbackResponseSchema.loadClass(FeedbackResponse);

const FeedbackResponses = mongoose.model('feedback_responses', FeedbackResponseSchema);

export { Feedbacks, FeedbackResponses };
