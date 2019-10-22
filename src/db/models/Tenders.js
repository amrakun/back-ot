import moment from 'moment';
import mongoose from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { Companies } from './';
import { field, isReached, encrypt, encryptArray, decryptArray, StatusPublishClose } from './utils';
import { TIER_TYPES } from './constants';

const FileSchema = mongoose.Schema(
  {
    name: field({ type: String, label: 'Name' }),
    url: field({ type: String, label: 'File url' }),
  },
  { _id: false },
);

const ProductSchema = mongoose.Schema(
  {
    code: field({ type: String, optional: true, label: 'OT material code' }),
    purchaseRequestNumber: field({
      type: Number,
      max: 99999999,
      optional: true,
      label: 'Purchase request number',
    }),
    shortText: field({ type: String, label: 'Short text' }),
    quantity: field({ type: Number, label: 'Quantity' }),
    uom: field({ type: String, label: 'UOM' }),
    manufacturer: field({ type: String, optional: true, label: 'Manufacturer' }),
    manufacturerPartNumber: field({
      type: String,
      optional: true,
      label: 'Manufacturer part number',
    }),
  },
  { _id: false },
);

const AwardAttachmentSchema = mongoose.Schema(
  {
    supplierId: field({ type: String, label: 'Supplier' }),
    attachment: field({ type: FileSchema, label: 'Attachment' }),
  },
  { _id: false },
);

// Tender schema
const TenderSchema = mongoose.Schema({
  // rfq, eoi, trfq(travel rfq)
  type: field({ type: String, label: 'Tender type' }),

  // goods, service
  rfqType: field({ type: String, optional: true, label: 'Rfq type' }),

  status: field({ type: String, label: 'Status' }),
  cancelReason: field({ type: String, optional: true, label: 'Cancel reason' }),

  isDeleted: field({ type: Boolean, default: false }),

  createdDate: field({ type: Date, label: 'Created date' }),
  createdUserId: field({ type: String, label: 'Created user' }),
  responsibleBuyerIds: field({ type: [String], optional: true, label: 'Responsible buyers' }),
  updatedDate: field({ type: Date, label: 'Updated date' }),

  number: field({ type: String, label: 'Number' }),
  name: field({ type: String, label: 'Name' }),
  content: field({ type: String, label: 'Email content' }),
  attachments: field({ type: [FileSchema], optional: true, label: 'Attachments' }),
  publishDate: field({ type: Date, label: 'Publish date' }),
  closeDate: field({ type: Date, label: 'Close date' }),
  file: field({ type: FileSchema, optional: true, label: 'File' }),
  sourcingOfficer: field({ type: String, optional: true, label: 'Sourcing officer name' }),
  reminderDay: field({ type: Number, optional: true, label: 'Reminder day' }),

  // encrypted supplier ids
  supplierIds: field({ type: [String], optional: true, label: 'Suppliers' }),
  tierTypes: field({ type: [String], optional: true, label: 'Tier types' }),
  isToAll: field({ type: Boolean, default: false, label: 'Invite all suppliers' }),

  requestedProducts: field({ type: [ProductSchema], optional: true, label: 'Requested products' }),

  // winners for eoi
  bidderListedSupplierIds: field({
    type: [String],
    optional: true,
    label: 'Bidder list suppliers',
  }),

  // Awarded response ids: encrypted supplier ids
  winnerIds: field({ type: [String], optional: true, label: 'Winners' }),
  awardNote: field({ type: String, optional: true, label: 'Award note' }),
  awardAttachments: field({
    type: [AwardAttachmentSchema],
    optional: true,
    label: 'Award attachments',
  }),

  sentRegretLetter: field({ type: Boolean, default: false, label: 'Is regret letter sent' }),

  // eoi documents
  requestedDocuments: field({ type: [String], optional: true, label: 'EOI documents' }),
  // used to show supplier count in logs if too many suppliers are selected
  supplierCount: field({ type: Number, label: 'Count of suppliers', optional: true }),
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
      // validation above empties supplierIds if isToAll: true
      supplierCount: supplierIds.length,
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

    const supplierCount = doc.supplierIds.length;

    Tender.validateSuppliers(doc);

    if (tender.status === 'awarded') {
      throw new Error(`Can not update ${tender.status} tender`);
    }

    doc.updatedDate = new Date();
    doc.supplierIds = encryptArray(doc.supplierIds);

    if (tender.status !== 'open') {
      doc.status = 'draft';
    }

    const extendedDoc = { ...doc, supplierCount };

    if (extendedDoc.isToAll) {
      extendedDoc.supplierCount = await this.calculateSupplierIds(extendedDoc, {}, true);
    }

    await this.update({ _id }, { $set: extendedDoc }, { runValidators: true });

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

      const supplier = await Companies.findOne({ _id: supplierId });

      if (supplier.isDeleted) {
        throw new Error('Can not award deleted supplier');
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
          { tierTypes: { $nin: [null, undefined], $in: [company.tierType] } },
          { supplierIds: { $in: [encrypt(user.companyId)] } },
        ],
      },
      { _id: 1 },
    );

    return tenders.map(tender => tender._id.toString());
  }

  /*
   * All participated suppliers except not interested
   */
  async participatedSuppliers({ onlyIds = false }) {
    const responses = await TenderResponses.find({
      tenderId: this._id,
      isNotInterested: { $ne: true },
      isSent: true,
    });
    const supplierIds = responses.map(response => response.supplierId);

    if (onlyIds) {
      return supplierIds;
    }

    return Companies.find({ _id: { $in: supplierIds } });
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

  static async calculateSupplierIds(tender, selector = {}, count = false) {
    let suppliers = [];

    if (tender.isToAll) {
      if (count) {
        return await Companies.find(selector, { _id: 1 }).count();
      }

      suppliers = await Companies.find(selector, { _id: 1 });
    }

    if (tender.tierTypes && tender.tierTypes.length > 0) {
      selector.tierType = { $in: tender.tierTypes };

      if (count) {
        return await Companies.find(selector, { _id: 1 }).count();
      }

      suppliers = await Companies.find(selector, { _id: 1 });
    }

    if (count) {
      return tender.supplierIds.length;
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

  getSupplierIds() {
    return decryptArray(this.supplierIds);
  }

  getWinnerIds() {
    return decryptArray(this.winnerIds);
  }

  getbidderListedSupplierIds() {
    return decryptArray(this.bidderListedSupplierIds);
  }

  async getNotChosenSuppliers(modifier = {}) {
    const notChosenResponses = await TenderResponses.find({
      tenderId: this._id,
      isSent: true,
      isNotInterested: { $ne: true },
      ...modifier,
    });

    const supplierIds = notChosenResponses.map(response => response.supplierId);

    return Companies.find({ _id: { $in: supplierIds } });
  }

  async getRfqNotChosenSuppliers() {
    return this.getNotChosenSuppliers({ supplierId: { $nin: this.winnerIds } });
  }

  async getNotBidderListedSuppliers() {
    return this.getNotChosenSuppliers({ supplierId: { $nin: this.bidderListedSupplierIds } });
  }

  /*
   * Mark as sent regret letter
   */
  sendRegretLetter() {
    if (this.sentRegretLetter) {
      throw new Error('Already sent');
    }

    if (
      this.type === 'eoi' &&
      (!this.bidderListedSupplierIds || this.bidderListedSupplierIds.length === 0)
    ) {
      throw new Error('Not bidder listed');
    }

    if (this.type != 'eoi' && (!this.winnerIds || this.winnerIds.length === 0)) {
      throw new Error('Not awarded');
    }

    return this.update({ sentRegretLetter: true });
  }

  /*
   * Mark as canceled
   */
  async cancel(userId, reason) {
    if (!reason) {
      throw new Error('Reason required');
    }

    if (this.createdUserId !== userId) {
      throw new Error('Permission denied');
    }

    if (['canceled', 'awarded'].includes(this.status)) {
      throw new Error('Can not cancel awarded or canceled tender');
    }

    await this.update({ status: 'canceled', cancelReason: reason });

    return Tenders.findOne({ _id: this._id });
  }

  /*
   * total suppliers count
   */
  requestedCount() {
    return Tenders.calculateSupplierIds(this, {}, true);
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
      isDeleted: { $ne: true },
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

    const check = async selector => {
      const tender = await Tenders.findOne(selector);

      if (!tender) {
        return false;
      }

      const supplierIds = await tender.getAllPossibleSupplierIds();

      return supplierIds.includes(user.companyId);
    };

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
    code: field({ type: String, optional: true, label: 'OT Material code' }),
    suggestedManufacturer: field({ type: String, optional: true, label: 'Suggested manufacturer' }),
    suggestedManufacturerPartNumber: field({
      type: String,
      optional: true,
      label: 'Suggested manufacturer part number',
    }),
    unitPrice: field({ type: Number, optional: true, label: 'Unit price (Excluding VAT)' }),
    totalPrice: field({ type: Number, optional: true, label: 'Total price' }),
    currency: field({ type: String, optional: true, enum: ['', 'MNT', 'USD'], label: 'Currency' }),
    leadTime: field({ type: Number, optional: true, label: 'Lead time' }),
    shippingTerms: field({
      type: String,
      optional: true,
      enum: ['', 'DDP - OT UB warehouse', 'DDP - OT site', 'FCA - Supplier Facility', 'EXW'],
      label: 'Shipping terms',
    }),
    alternative: field({
      type: String,
      optional: true,
      enum: ['', 'Yes', 'No'],
      label: 'Alternative',
    }),
    comment: field({ type: String, optional: true, label: 'Comment' }),
    file: field({ type: FileSchema, optional: true, label: 'Picture (If required)' }),
  },
  { _id: false },
);

const RespondedDocumentSchema = mongoose.Schema(
  {
    name: field({ type: String, optional: true, label: 'Name' }),
    isSubmitted: field({ type: Boolean, optional: true, label: 'Is submitted' }),
    notes: field({ type: String, optional: true, label: 'Notes' }),
    file: field({ type: FileSchema, optional: true, label: 'File' }),
  },
  { _id: false },
);

const TenderResponseSchema = mongoose.Schema({
  createdDate: field({ type: Date, index: true, label: 'Created date' }),
  tenderId: field({ type: String, index: true, label: 'Tender id' }),
  supplierId: field({ type: String, index: true, label: 'Supplier' }),
  respondedProducts: field({
    type: [RespondedProductSchema],
    label: 'Responded products',
    optional: true,
  }),

  // used both in service, travel rfq
  respondedFiles: field({ type: [FileSchema], label: 'Responded files', optional: true }),

  respondedDocuments: field({
    type: [RespondedDocumentSchema],
    label: 'Responded documents',
    optional: true,
  }),

  // when tender type is eoi, we can still receive responses after closedDate
  // So eoi status will be late
  status: field({ type: String, optional: true, index: true, label: 'Status' }),

  isSent: field({ type: Boolean, optional: true, index: true, label: 'Is sent' }),
  sentDate: field({ type: Date, optional: true, label: 'Sent date' }),

  isNotInterested: field({
    type: Boolean,
    default: false,
    index: true,
    label: 'Is not interested',
  }),
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

    // Checking whether this user is involved in this tender or not
    if (!tender.isToAll) {
      if (
        (!tender.tierTypes || tender.tierTypes.length === 0) &&
        !tender.supplierIds.includes(encrypt(supplierId))
      )
        throw Error('Not participated');
    }

    // can send to only open rfqs
    if (tender.type === 'rfq' && tender.status !== 'open') {
      throw Error('This tender is not available');
    }

    if (!supplier.isSentRegistrationInfo) {
      throw Error('Please complete registration stage');
    }

    if (tender.type === 'eoi' && !supplier.isSentPrequalificationInfo) {
      throw Error('Please complete prequalification stage');
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

export const TenderRelatedSchemas = [
  FileSchema,
  ProductSchema,
  AwardAttachmentSchema,
  TenderSchema,
  RespondedProductSchema,
  RespondedDocumentSchema,
  TenderResponseSchema,
];

export { Tenders, TenderResponses };
