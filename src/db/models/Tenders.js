import moment from 'moment';
import mongoose from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { field, isReached, encrypt, encryptArray, decryptArray, StatusPublishClose } from './utils';

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
    purchaseRequestNumber: field({ type: Number, max: 99999999 }),
    shortText: field({ type: String }),
    quantity: field({ type: Number }),
    uom: field({ type: String }),
    manufacturer: field({ type: String }),
    manufacturerPartNumber: field({ type: Number, max: 99999999 }),
  },
  { _id: false },
);

// Tender schema
const TenderSchema = mongoose.Schema({
  // rfq, eoi, trfq(travel rfq)
  type: field({ type: String }),

  status: field({ type: String }),

  createdDate: field({ type: Date }),
  createdUserId: field({ type: String }),

  number: field({ type: String }),
  name: field({ type: String }),
  content: field({ type: String }),
  attachments: field({ type: [FileSchema], optional: true }),
  publishDate: field({ type: Date }),
  closeDate: field({ type: Date }),
  file: field({ type: FileSchema, optional: true }),
  sourcingOfficer: field({ type: String, optional: true }),
  reminderDay: field({ type: Number, optional: true }),

  // encrypted supplier ids
  supplierIds: field({ type: [String] }),

  requestedProducts: field({ type: [ProductSchema], optional: true }),

  // Awarded response ids: encrypted supplier ids
  winnerIds: field({ type: [String], optional: true }),

  sentRegretLetter: field({ type: Boolean, default: false }),

  // eoi documents
  requestedDocuments: field({ type: [String], optional: true }),
});

class Tender extends StatusPublishClose {
  /**
   * Create new tender
   * @param {Object} doc - tender fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created tender object
   */
  static async createTender(doc, userId) {
    const saved = await Tenders.create({
      ...doc,
      status: 'draft',
      createdDate: new Date(),
      createdUserId: userId,
      supplierIds: encryptArray(doc.supplierIds),
    });

    return this.findOne({ _id: saved._id });
  }

  /**
   * Update tender information
   * @param {String} tenderId
   * @param {Object} doc - tender fields
   * @return {Promise} updated tender info
   */
  static async updateTender(_id, doc) {
    const tender = await this.findOne({ _id });

    if (['awarded', 'open'].includes(tender.status)) {
      throw new Error(`Can not update ${tender.status} tender`);
    }

    doc.supplierIds = encryptArray(doc.supplierIds);
    doc.status = 'draft';

    await this.update({ _id }, { $set: doc }, { runValidators: true });

    return this.findOne({ _id });
  }

  /*
   * Remove tender
   * @param {String} _id - Tender id
   * @return {Promise} - remove method response
   */
  static async removeTender(_id) {
    const tender = await this.findOne({ _id });

    if (tender.status !== 'draft') {
      throw new Error('Can not delete open or closed tender');
    }

    return this.remove({ _id });
  }

  /*
   * Choose tender winners
   * @param {String} _id - Tender id
   * @param {String} supplierIds - Company ids
   * @return {Promise} - Updated tender object
   */
  static async award(_id, supplierIds) {
    if (supplierIds.length === 0) {
      throw new Error('Select some suppliers');
    }

    for (const supplierId of supplierIds) {
      const responses = await TenderResponses.find({ tenderId: _id });
      const response = (responses || []).find(res => res.supplierId === supplierId);

      if (!response) {
        throw new Error('Invalid supplier');
      }

      if (response.isNotInterested) {
        throw new Error('Invalid supplier');
      }
    }

    await this.update(
      { _id },
      { $set: { status: 'awarded', winnerIds: encryptArray(supplierIds) } },
    );

    return this.findOne({ _id });
  }

  getSupplierIds() {
    return decryptArray(this.supplierIds);
  }

  getWinnerIds() {
    return decryptArray(this.winnerIds);
  }

  /*
   * Mark as sent regret letter
   */
  sendRegretLetter() {
    if (this.type !== 'eoi' && (!this.winnerIds || this.winnerIds.length === 0)) {
      throw new Error('Not awarded');
    }

    if (this.sentRegretLetter) {
      throw new Error('Already sent');
    }

    return this.update({ sentRegretLetter: true });
  }

  /*
   * Mark as canceled
   */
  async cancel() {
    if (this.status === 'closed') {
      throw new Error('This tender is closed');
    }

    await this.update({ status: 'canceled' });

    return Tenders.findOne({ _id: this._id });
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

  /*
   * Find tenders that need to reminded now
   */
  static async tendersToRemind() {
    const opens = await this.find({
      status: 'open',
      reminderDay: { $exists: true },
    });

    const results = [];

    for (let open of opens) {
      // reminder date is reached
      const date = moment(open.closeDate).subtract(open.reminderDay, 'days');

      if (isReached(date)) {
        results.push(open);
      }
    }

    return results;
  }

  /*
   * Check whether given user is authorized to download given file or not
   * if given file is stored in tenders collection
   */
  static async isAuthorizedToDownload(key, user) {
    // buyer can download all files
    if (!user.isSupplier) {
      return true;
    }

    const check = extraSelector =>
      Tenders.findOne({ supplierIds: { $in: encryptArray([user.companyId]) }, ...extraSelector });

    if (await check({ 'file.url': key })) {
      return true;
    }

    if (await check({ 'attachments.url': key })) {
      return true;
    }

    return false;
  }
}

const { ENCRYPTION_SECRET } = process.env;

TenderSchema.plugin(fieldEncryption, {
  fields: ['name', 'number', 'content'],
  secret: ENCRYPTION_SECRET,
  useAes256Ctr: true,
});

TenderSchema.loadClass(Tender);

const Tenders = mongoose.model('tenders', TenderSchema);

// Tender responses =====================
const RespondedProductSchema = mongoose.Schema(
  {
    code: field({ type: String, optional: true }),
    suggestedManufacturer: field({ type: String, optional: true }),
    suggestedManufacturerPartNumber: field({ type: Number, optional: true }),
    unitPrice: field({ type: Number, optional: true }),
    totalPrice: field({ type: Number, optional: true }),
    leadTime: field({ type: Number, optional: true }),
    shippingTerms: field({ type: String, optional: true }),
    comment: field({ type: String, optional: true }),
    file: field({ type: FileSchema, optional: true }),
  },
  { _id: false },
);

const RespondedDocumentSchema = mongoose.Schema(
  {
    name: field({ type: String, optional: true }),
    isSubmitted: field({ type: Boolean, optional: true }),
    notes: field({ type: String, optional: true }),
    file: field({ type: FileSchema, optional: true }),
  },
  { _id: false },
);

const TenderResponseSchema = mongoose.Schema({
  createdDate: field({ type: Date }),
  tenderId: field({ type: String }),
  supplierId: field({ type: String }),
  respondedProducts: [RespondedProductSchema],
  respondedServiceFiles: [FileSchema],
  respondedDocuments: [RespondedDocumentSchema],

  // when tender type is eoi, we can still receive responses after closedDate
  // So eoi status will be late
  status: field({ type: String, optional: true }),

  isSent: field({ type: Boolean, optional: true }),
  sentDate: field({ type: Date, optional: true }),

  isNotInterested: field({ type: Boolean, default: false }),
});

TenderResponseSchema.plugin(fieldEncryption, {
  fields: ['supplierId'],
  secret: ENCRYPTION_SECRET,
  useAes256Ctr: true,
});

class TenderResponse {
  static async findBySupplierId({ tenderId, supplierId }) {
    const responses = await TenderResponses.find({ tenderId });
    return (responses || []).find(res => res.supplierId === supplierId);
  }

  /**
   * Create new tender response
   * @param {Object} doc - tender response fields
   * @return {Promise} newly created tender response object
   */
  static async createTenderResponse(doc) {
    const { tenderId, supplierId } = doc;

    const tender = await Tenders.findOne({ _id: tenderId });

    // can send to only open rfqs
    if (tender.type === 'rfq' && tender.status !== 'open') {
      throw Error('This tender is not available');
    }

    const previousEntry = await this.findBySupplierId({ tenderId, supplierId });

    // prevent duplications
    if (previousEntry) {
      return previousEntry;
    }

    doc.createdDate = new Date();
    doc.isSent = false;

    if (doc.isNotInterested) {
      doc.isSent = true;
      doc.sentDate = new Date();
    }

    const saved = await this.create(doc);

    return this.findOne({ _id: saved._id });
  }

  /*
   * Update tender response if tender is available
   * @param {Object} doc - Update doc
   * @return - Updated tender response
   */
  static async updateTenderResponse(doc) {
    const response = await this.findBySupplierId(doc);

    if (!response) {
      throw new Error('Response not found');
    }

    const tender = await Tenders.findOne({ _id: response.tenderId });

    if (tender.type === 'rfq' && tender.status !== 'open') {
      throw Error('This tender is not available');
    }

    await response.update(doc);

    return this.findBySupplierId(doc);
  }

  /**
   * Mark this response as sent
   * @return - Updated response object
   */
  async send() {
    const tender = await Tenders.findOne({ _id: this.tenderId });

    if (['canceled', 'draft'].includes(tender.status)) {
      throw Error('This tender is not available');
    }

    // can send to only open rfqs
    if (tender.type !== 'eoi' && tender.status === 'closed') {
      throw Error('This tender is not available');
    }

    // can send to even closed eois
    if (tender.type === 'eoi') {
      await this.update({ status: tender.status === 'closed' ? 'late' : 'onTime' });
    }

    await this.update({ isSent: true, sentDate: new Date() });

    return TenderResponses.findOne({ _id: this._id });
  }

  /*
   * Check whether given user is authorized to download given file or not
   * if given file is stored in tender_responses collection
   */
  static async isAuthorizedToDownload(key, user) {
    // buyer can download all files
    if (!user.isSupplier) {
      return true;
    }

    const check = extraSelector =>
      TenderResponses.findOne({ supplierId: encrypt(user.companyId), ...extraSelector });

    if (await check({ 'respondedProducts.file.url': key })) {
      return true;
    }

    if (await check({ 'respondedDocuments.file.url': key })) {
      return true;
    }

    if (await check({ 'respondedServiceFiles.url': key })) {
      return true;
    }

    return false;
  }
}

TenderResponseSchema.loadClass(TenderResponse);

const TenderResponses = mongoose.model('tender_responses', TenderResponseSchema);

export { Tenders, TenderResponses };
