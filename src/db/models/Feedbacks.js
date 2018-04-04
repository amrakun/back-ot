import mongoose from 'mongoose';
import { field, isReached } from './utils';

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

  /*
   * Close open success feedbacks if closeDate is here
   * @return null
   */
  static async closeOpens() {
    const openFeedbacks = await this.find({ status: 'open' });

    for (let openFeedback of openFeedbacks) {
      // close date is today
      if (isReached(openFeedback.closeDate)) {
        // change status to closed
        await this.update({ _id: openFeedback._id }, { $set: { status: 'closed' } });
      }
    }

    return 'done';
  }
}

FeedbackSchema.loadClass(Feedback);

const Feedbacks = mongoose.model('feedbacks', FeedbackSchema);

const FeedbackResponseSchema = mongoose.Schema({
  feedbackId: field({ type: String }),
  supplierId: field({ type: String }),

  createdDate: field({ type: Date }),
  status: field({ type: String }),

  // Please provide your employment details
  totalEmploymentOt: field({ type: Number }),
  totalEmploymentUmnugobi: field({ type: Number }),
  // Changes in employment number after working with OT
  employmentChangesAfter: field({ type: Number }),

  // Of which, how many employee work related to the scope you provide to OT
  numberOfEmployeeWorkToScopeNational: field({ type: Number }),
  numberOfEmployeeWorkToScopeUmnugobi: field({ type: Number }),

  // Please provide procurement spend details
  procurementTotalSpend: field({ type: Number }),
  procurementNationalSpend: field({ type: Number }),
  procurementUmnugobiSpend: field({ type: Number }),

  corporateSocial: field({ type: String, optional: true }),
  otherStories: field({ type: String, optional: true }),
});

class FeedbackResponse {
  /**
   * Create new feedback response
   * @param {Object} doc - feedback response fields
   * @return {Promise} newly created feedback response object
   */
  static async createFeedbackResponse(doc) {
    const { feedbackId, supplierId } = doc;

    doc.createdDate = new Date();

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
