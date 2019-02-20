import moment from 'moment';
import mongoose from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { Companies } from './';
import { field, isReached, encrypt, encryptArray, decryptArray, StatusPublishClose } from './utils';
import { TIER_TYPES } from './constants';

const FileSchema = mongoose.Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
  },
  { _id: false },
);

const ProductSchema = mongoose.Schema(
  {
    code: field({ type: String, optional: true }),
    purchaseRequestNumber: field({ type: Number, max: 99999999, optional: true }),
    shortText: field({ type: String }),
    quantity: field({ type: Number }),
    uom: field({ type: String }),
    manufacturer: field({ type: String, optional: true }),
    manufacturerPartNumber: field({ type: String, optional: true }),
  },
  { _id: false },
);

const AwardAttachmentSchema = mongoose.Schema(
  {
    supplierId: field({ type: String }),
    attachment: field({ type: FileSchema }),
  },
  { _id: false },
);

// Tender schema
const TenderSchema = mongoose.Schema({
  // rfq, eoi, trfq(travel rfq)
  type: field({ type: String }),

  // goods, service
  rfqType: field({ type: String, optional: true }),

  status: field({ type: String }),

  createdDate: field({ type: Date }),
  createdUserId: field({ type: String }),
  responsibleBuyerIds: field({ type: [String], optional: true }),
  updatedDate: field({ type: Date }),

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
  supplierIds: field({ type: [String], optional: true }),
  tierTypes: field({ type: [String], optional: true }),
  isToAll: field({ type: Boolean, default: false }),

  requestedProducts: field({ type: [ProductSchema], optional: true }),

  // Awarded response ids: encrypted supplier ids
  winnerIds: field({ type: [String], optional: true }),
  awardNote: field({ type: String, optional: true }),
  awardAttachments: field({ type: [AwardAttachmentSchema], optional: true }),

  sentRegretLetter: field({ type: Boolean, default: false }),

  // eoi documents
  requestedDocuments: field({ type: [String], optional: true }),
});

class Tender extends StatusPublishClose {
  static validateSuppliers(doc) {
    const { tierTypes, isToAll, supplierIds = [] } = doc;

    if (isToAll) {
      doc.tierTypes = [];
      doc.supplierIds = [];
    }

    if (tierTypes && tierTypes.length > 0) {
      doc.supplierIds = [];

      const commonItems = tierTypes.filter(t => TIER_TYPES.includes(t));

      if (commonItems.length !== tierTypes.length) {
        throw new Error('Invalid tier type');
      }
    }

    if (!tierTypes && !isToAll && supplierIds.length === 0) {
      throw new Error('Suppliers are required');
    }

    return doc;
  }

  /**
   * @returns {String}
   */
  getLabelOfType() {
    switch (this.type) {
      case 'rfq':
        return 'RFQ';
      case 'eoi':
        return 'EOI';
      case 'trfq':
        return 'Travel RFQ';
      default:
        throw new Error('Invalid tender type');
    }
  }
  /**
   * Create new tender
   * @param {Object} doc - tender fields
   * @param {Object} userId - Creating user
   * @return {Promise} newly created tender object
   */
  static async createTender(doc, userId) {
    const supplierIds = doc.supplierIds || [];

    Tender.validateSuppliers(doc);

    const extendedDoc = {
      ...doc,
      status: 'draft',
      createdDate: new Date(),
      createdUserId: userId,
      updatedDate: new Date(),
      supplierIds: encryptArray(supplierIds),
    };

    if (doc.type === 'rfq' && !['goods', 'service'].includes(doc.rfqType)) {
      throw new Error('Invalid rfq type');
    }

    const saved = await Tenders.create(extendedDoc);

    return this.findOne({ _id: saved._id });
  }

  /**
   * Update tender information
   * @param {String} tenderId
   * @param {Object} doc - tender fields
   * @return {Promise} updated tender info
   */
  static async updateTender(_id, doc, userId) {
    const tender = await this.findOne({ _id });

    // Only created user can edit
    if (tender.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

    Tender.validateSuppliers(doc);

    if (tender.status === 'awarded') {
      throw new Error(`Can not update ${tender.status} tender`);
    }

    // if tender is not draft and requirements are changed then reset
    // previously sent responses
    const isChanged = await tender.isChanged(doc);

    // reset responses's sent status
    if (['closed', 'canceled', 'open'].includes(tender.status) && isChanged) {
      await TenderResponses.update(
        { tenderId: tender._id, isNotInterested: { $ne: true } },
        { $set: { isSent: false } },
        { multi: true },
      );
    }

    doc.updatedDate = new Date();
    doc.supplierIds = encryptArray(doc.supplierIds);

    if (tender.status !== 'open') {
      doc.status = 'draft';
    }

    await this.update({ _id }, { $set: doc }, { runValidators: true });

    return this.findOne({ _id });
  }

  /*
   * Choose tender winners
   * @param {String} _id - Tender id
   * @param {String} supplierIds - Company ids
   * @return {Promise} - Updated tender object
   */
  static async award({ _id, supplierIds, note, attachments }, userId) {
    const tender = await Tenders.findOne({ _id });

    if (!tender) {
      throw new Error('Tender not found');
    }

    // Only created user can award
    if (tender.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

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
      {
        $set: {
          status: 'awarded',
          awardNote: note,
          awardAttachments: attachments,
          winnerIds: encryptArray(supplierIds),
        },
      },
    );

    return this.findOne({ _id });
  }

  /*
   * All tenders that given user can see
   */
  static async getPossibleTendersByUser(user) {
    const company = await Companies.findOne({ _id: user.companyId });

    const tenders = await Tenders.find(
      {
        $or: [
          { isToAll: true },
          { tierTypes: { $in: [company.tierType] } },
          { supplierIds: { $in: [encrypt(user.companyId)] } },
        ],
      },
      { _id: 1 },
    );

    return tenders.map(tender => tender._id.toString());
  }

  /*
   * Compare old supplier ids with given doc
   */
  async getNewSupplierIds(doc) {
    const oldSupplierIds = await this.getExactSupplierIds();

    const currentSupplierIds = await Tenders.calculateSupplierIds({
      ...doc,
      supplierIds: encryptArray(doc.supplierIds || []),
    });

    return currentSupplierIds.filter(supplierId => !oldSupplierIds.includes(supplierId));
  }

  /*
   * Get exact supplier ids when it is last updated
   */
  async getExactSupplierIds() {
    return Tenders.calculateSupplierIds(this, { createdDate: { $lte: this.updatedDate } });
  }

  static async calculateSupplierIds(tender, selector = {}) {
    let suppliers = [];

    if (tender.isToAll) {
      suppliers = await Companies.find(selector, { _id: 1 });
    }

    if (tender.tierTypes && tender.tierTypes.length > 0) {
      selector.tierType = { $in: tender.tierTypes };
      suppliers = await Companies.find(selector, { _id: 1 });
    }

    if (suppliers.length > 0) {
      return suppliers.map(sup => sup._id.toString());
    }

    return decryptArray(tender.supplierIds);
  }

  /*
   * All suppliers who can see this tender
   */
  getAllPossibleSupplierIds() {
    return Tenders.calculateSupplierIds(this);
  }

  getWinnerIds() {
    return decryptArray(this.winnerIds);
  }

  /*
   * Mark as sent regret letter
   */
  sendRegretLetter() {
    if (this.type == 'eoi') {
      throw new Error('Invalid request');
    }

    if (!this.winnerIds || this.winnerIds.length === 0) {
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
  async cancel(userId) {
    if (this.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

    if (['closed', 'awarded'].includes(this.status)) {
      throw new Error('Can not cancel awarded or closed tender');
    }

    await this.update({ status: 'canceled' });

    return Tenders.findOne({ _id: this._id });
  }

  /*
   * total suppliers count
   */
  async requestedCount() {
    const supplierIds = await Tenders.calculateSupplierIds(this);

    return supplierIds.length;
  }

  /*
   * Suppliers that are filled form. Excluded not interested
   */
  submittedCount() {
    return TenderResponses.find({
      tenderId: this._id,
      isNotInterested: false,
      isSent: true,
    }).count();
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
    const requestedCount = await this.requestedCount();

    return requestedCount - respondedCount;
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

    const check = async (selector) => {
      const tender = await Tenders.findOne(selector);

      if (!tender) {
        return false;
      }

      const supplierIds = await tender.getExactSupplierIds();

      return supplierIds.includes(user.companyId);
    }

    if (await check({ 'file.url': key })) {
      return true;
    }

    if (await check({ 'attachments.url': key })) {
      return true;
    }

    return false;
  }

  /*
   * Current document is different that old tender
   */
  async isChanged(doc) {
    if (
      this.content !== doc.content ||
      this.number !== doc.number ||
      this.name !== doc.name ||
      JSON.stringify(this.requestedDocuments || []) !==
        JSON.stringify(doc.requestedDocuments || []) ||
      JSON.stringify(this.requestedProducts || []) !== JSON.stringify(doc.requestedProducts || [])
    ) {
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
    suggestedManufacturerPartNumber: field({ type: String, optional: true }),
    unitPrice: field({ type: Number, optional: true }),
    totalPrice: field({ type: Number, optional: true }),
    currency: field({ type: String, optional: true, enum: ['', 'MNT', 'USD'] }),
    leadTime: field({ type: Number, optional: true }),
    shippingTerms: field({
      type: String,
      optional: true,
      enum: ['', 'DDP - OT UB warehouse', 'DDP - OT site', 'FCA - Supplier Facility', 'EXW'],
    }),
    alternative: field({ type: String, optional: true, enum: ['', 'Yes', 'No'] }),
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

  // used both in service, travel rfq
  respondedFiles: [FileSchema],

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
    const supplier = await Companies.findOne({ _id: supplierId });

    if (tender.type === 'eoi' && !supplier.basicInfo) {
      throw Error('Please complete registration stage');
    }

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

    if (await check({ 'respondedFiles.url': key })) {
      return true;
    }

    return false;
  }
}

TenderResponseSchema.loadClass(TenderResponse);

const TenderResponses = mongoose.model('tender_responses', TenderResponseSchema);

export { Tenders, TenderResponses };
