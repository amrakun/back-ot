import mongoose from 'mongoose';
import moment from 'moment';
import { field } from './utils';

const FileSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
  },
  { _id: false },
);

const ProductSchema = mongoose.Schema(
  {
    code: field({ type: String }),
    purchaseRequestNumber: field({ type: Number }),
    shortText: field({ type: String }),
    quantity: field({ type: Number }),
    uom: field({ type: String }),
    manufacturer: field({ type: String }),
    manufacturerPartNumber: field({ type: Number }),
  },
  { _id: false },
);

// Tender schema
const TenderSchema = mongoose.Schema({
  // rfq, eoi
  type: field({ type: String }),

  status: field({ type: String }),

  createdUserId: field({ type: String }),

  number: field({ type: Number }),
  name: field({ type: String }),
  content: field({ type: String }),
  publishDate: field({ type: Date }),
  closeDate: field({ type: Date }),
  file: field({ type: FileSchema }),
  reminderDay: field({ type: Number }),
  supplierIds: field({ type: [String] }),
  requestedProducts: field({ type: [ProductSchema] }),

  // Awarded response id
  winnerId: field({ type: String, optional: true }),

  sentRegretLetter: field({ type: Boolean, default: false }),

  // eoi documents
  requestedDocuments: field({ type: [String] }),
});

class Tender {
  /**
   * Create new tender
   * @param {Object} doc - tender fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created tender object
   */
  static createTender(doc, userId) {
    const now = new Date();

    let status = 'draft';

    // publish date is today
    if (moment(doc.publishDate).diff(now, 'days') === 0) {
      status = 'open';
    }

    return this.create({ ...doc, status, createdUserId: userId });
  }

  /**
   * Update tender information
   * @param {String} tenderId
   * @param {Object} doc - tender fields
   * @return {Promise} updated tender info
   */
  static async updateTender(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove tender
   * @param {String} _id - Tender id
   * @return {Promise} - remove method response
   */
  static removeTender(_id) {
    return this.remove({ _id });
  }

  /*
   * Choose tender winner
   * @param {String} _id - Tender id
   * @param {String} supplierId - Company id
   * @return {Promise} - Updated tender object
   */
  static async award(_id, supplierId) {
    await this.update({ _id }, { $set: { status: 'awarded', winnerId: supplierId } });

    return this.findOne({ _id });
  }

  /*
   * Open drafted tenders
   * @return null
   */
  static async publishDrafts() {
    const now = new Date();
    const draftTenders = await this.find({ status: 'draft' });

    for (let draftTender of draftTenders) {
      // publish date is today
      if (moment(draftTender.publishDate).diff(now, 'days') === 0) {
        // change status to open
        await this.update({ _id: draftTender._id }, { $set: { status: 'open' } });
      }
    }

    return 'done';
  }

  /*
   * Close open tenders if closeDate is here
   * @return null
   */
  static async closeOpens() {
    const now = new Date();
    const openTenders = await this.find({ status: 'open' });

    for (let openTender of openTenders) {
      // close date is today
      if (moment(openTender.closeDate).diff(now, 'days') === 0) {
        // change status to closed
        await this.update({ _id: openTender._id }, { $set: { status: 'closed' } });
      }
    }

    return 'done';
  }

  /*
   * Mark as sent regret letter
   */
  sendRegretLetter() {
    if (!this.winnerId) {
      throw new Error('Not awarded');
    }

    if (this.sentRegretLetter) {
      throw new Error('Already sent');
    }

    return this.update({ sentRegretLetter: true });
  }

  /*
   * total suppliers count
   */
  requestedCount() {
    return this.supplierIds.length;
  }

  /*
   * Suppliers that are filled form. Excluded not interested
   */
  submittedCount() {
    return TenderResponses.find({ tenderId: this._id, isNotInterested: false }).count();
  }

  /*
   * Count of suppliers that clicked not interested
   */
  notInterestedCount() {
    return TenderResponses.find({ tenderId: this._id, isNotInterested: true }).count();
  }

  /*
   * Count of suppliers that not responded
   */
  async notRespondedCount() {
    const respondedCount = (await this.submittedCount()) + (await this.notInterestedCount());

    return this.requestedCount() - respondedCount;
  }
}

TenderSchema.loadClass(Tender);

const Tenders = mongoose.model('tenders', TenderSchema);

// Tender responses =====================
const RespondedProductSchema = mongoose.Schema(
  {
    code: field({ type: String }),
    suggestedManufacturer: field({ type: String }),
    suggestedManufacturerPartNumber: field({ type: Number }),
    unitPrice: field({ type: Number }),
    totalPrice: field({ type: Number }),
    leadTime: field({ type: Number }),
    shippingTerms: field({ type: String }),
    comment: field({ type: String }),
    file: field({ type: FileSchema }),
  },
  { _id: false },
);

const RespondedDocumentSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    isSubmitted: field({ type: Boolean }),
    notes: field({ type: String }),
    file: field({ type: FileSchema }),
  },
  { _id: false },
);

const TenderResponseSchema = mongoose.Schema({
  tenderId: field({ type: String }),
  supplierId: field({ type: String }),
  respondedProducts: [RespondedProductSchema],
  respondedDocuments: [RespondedDocumentSchema],

  isNotInterested: field({ type: Boolean, default: false }),
});

class TenderResponse {
  /**
   * Create new tender response
   * @param {Object} doc - tender response fields
   * @return {Promise} newly created tender response object
   */
  static async createTenderResponse(doc) {
    const { tenderId, supplierId } = doc;

    const previousEntry = await this.findOne({ tenderId, supplierId });

    // prevent duplications
    if (previousEntry) {
      return previousEntry;
    }

    return this.create(doc);
  }
}

TenderResponseSchema.loadClass(TenderResponse);

const TenderResponses = mongoose.model('tender_responses', TenderResponseSchema);

export { Tenders, TenderResponses };
