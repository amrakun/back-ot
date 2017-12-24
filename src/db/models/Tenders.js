import mongoose from 'mongoose';
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

  number: field({ type: Number }),
  name: field({ type: String }),
  content: field({ type: String }),
  publishDate: field({ type: Date }),
  closeDate: field({ type: Date }),
  file: field({ type: FileSchema }),
  reminderDay: field({ type: Number }),
  supplierIds: field({ type: [String] }),
  requestedProducts: field({ type: [ProductSchema] }),
});

class Tender {
  /**
   * Create new tender
   * @param {Object} doc - tender fields
   * @return {Promise} newly created tender object
   */
  static async createTender(doc) {
    return this.create(doc);
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
    return Tenders.remove({ _id });
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

const TenderResponseSchema = mongoose.Schema({
  tenderId: field({ type: String }),
  supplierId: field({ type: String }),
  respondedProducts: [RespondedProductSchema],
});

const TenderResponses = mongoose.model('tender_responses', TenderResponseSchema);

export { Tenders, TenderResponses };
