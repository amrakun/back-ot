import mongoose from 'mongoose';
import moment from 'moment';
import { field, isEmpty, generateSearchText, generateFieldWithNames } from './utils';
import {
  FileSchema,
  BasicInfoSchema,
  GroupInfoSchema,
  PersonSchema,
  ShareholderSchema,
} from './Companies';
import { basicInfoFieldNames, groupInfoFieldNames, searchFieldNames } from './constants';
import { generateFields } from './Qualifications';
import { Companies, Configs } from './';

const DPersonSchema = generateFields(PersonSchema, String);
const ManagementTeamInfoSchema = mongoose.Schema(
  {
    managingDirector: field({
      type: DPersonSchema,
      optional: true,
      label: 'Managing director',
    }),
    executiveOfficer: field({
      type: DPersonSchema,
      optional: true,
      label: 'Executive officer',
    }),
  },
  { _id: false },
);

const ShareholderInfoSchema = mongoose.Schema(
  {
    shareholders: field({
      type: [generateFields(ShareholderSchema, String)],
      optional: true,
      label: 'Shareholders',
    }),
  },
  { _id: false },
);

export const DueDiligenceSchema = mongoose.Schema({
  supplierId: field({ type: String, label: 'Supplier' }),
  files: field({ type: [FileSchema], label: 'File', optional: true }),
  createdUserId: field({ type: String, label: 'Created user', optional: true }),
  fileUploadDate: field({ type: Date, label: 'File upload date', optional: true }),
  createdDate: field({ type: Date, label: 'Created date', default: new Date() }),
  date: field({ type: Date, label: 'Date', optional: true }),
  closeDate: field({ type: Date, label: 'Close date', optional: true }),
  supplierSubmissionDate: field({ type: Date, label: 'Supplier submission date', optional: true }),
  risk: field({ type: String, label: 'Risk', optional: true }),
  reminderDay: field({ type: Number, optional: true, label: 'Reminder day' }),

  shareholderInfo: field({
    type: ShareholderInfoSchema,
    optional: true,
    label: 'Share holder information',
  }),
  managementTeamInfo: field({
    type: ManagementTeamInfoSchema,
    optional: true,
    label: 'Management team information',
  }),
  basicInfo: field({
    type: generateFieldWithNames(basicInfoFieldNames, BasicInfoSchema),
    optional: true,
    label: 'Company information',
  }),
  groupInfo: field({
    type: generateFieldWithNames(groupInfoFieldNames, GroupInfoSchema),
    optional: true,
    label: 'Group information',
  }),
  searchText: generateFieldWithNames(searchFieldNames),
});

class DueDiligence {
  static async getLastDueDiligence(supplierId, extraSelector = {}) {
    const dueDilingences = await this.find({ supplierId, ...extraSelector }).sort({
      createdDate: 1,
    });

    return dueDilingences.pop();
  }
  /*
   * Create die diligence
   * @param String supplierId - Company id
   * @return created due diligence
   */
  static createDueDiligence(supplierId, doc = {}) {
    return this.create({ supplierId, ...doc });
  }

  /**
   * Update sub section info
   * @param {String } supplierId - Company id
   * @param {String} key - basicInfo, contactInfo etc ...
   * @param {Object} value - related update doc
   * @return Updated company object
   */
  static async updateSection(supplierId, key, value) {
    const dd = await this.getLastDueDiligence(supplierId);

    if (!dd) {
      return this.create({ supplierId, [key]: value });
    }

    const _id = dd._id;

    const searchText = generateSearchText({ ...dd.toJSON(), [key]: value });

    await this.update({ _id }, { $set: { [key]: value, searchText } });

    return this.findOne({ _id });
  }

  /*
   * Validate die diligence
   * @param String _id - Company id
   * @return updated company
   */
  static async saveDueDiligence(supplierId, user) {
    const dd = await this.getLastDueDiligence(supplierId);

    const recommendations = dd
      ? {
          basicInfo: dd.basicInfo,
          shareholderInfo: dd.shareholderInfo,
          groupInfo: dd.groupInfo,
          managementTeamInfo: dd.managementTeamInfo,
        }
      : null;

    const isValidated = () => {
      if (recommendations) {
        for (let key of Object.keys(recommendations)) {
          const isParent = ['shareholderInfo', 'managementTeamInfo'].includes(key);

          const value = recommendations[key];

          if (value) {
            if (!isEmpty(value.toJSON(), isParent)) return false;
          }
        }
      }

      return true;
    };

    const company = await Companies.findOne({ _id: supplierId });

    await company.update({
      isDueDiligenceValidated: isValidated(),
      isDueDiligenceEditable: false,
    });

    if (!dd) {
      this.create({ supplierId, createdUserId: user._id });

      return Companies.findOne({ _id: supplierId });
    }

    // update fields
    await this.update(
      { _id: dd._id },
      {
        $set: {
          createdUserId: user._id,
        },
      },
    );

    return Companies.findOne({ _id: supplierId });
  }

  /*
   * Validate die diligence
   * @param String supplierId - Company id
   * @return updated company
   */
  static async cancelDueDiligence(supplierId) {
    const _id = supplierId;
    const company = await Companies.findOne({ _id });

    if (company.isDueDiligenceValidated === false) {
      const dd = await this.getLastDueDiligence(_id);

      await this.update(
        { _id: dd._id },
        {
          $unset: {
            basicInfo: 1,
            shareholderInfo: 1,
            managementTeamInfo: 1,
            groupInfo: 1,
            closeDate: 1,
            reminderDay: 1,
          },
        },
      );
    }

    // update fields
    await Companies.update(
      { _id },
      {
        $unset: {
          isDueDiligenceValidated: 1,
          isDueDiligenceEditable: 1,
        },
      },
    );

    return Companies.findOne({ _id });
  }

  static async enableDueDiligence(_id) {
    await Companies.findOne({ _id });

    const updateQuery = {
      $set: {
        isDueDiligenceEditable: true,
      },
    };

    updateQuery.$unset = { isDueDiligenceValidated: 1 };

    await Companies.update({ _id }, updateQuery);

    return Companies.findOne({ _id });
  }

  /*
   * Add new due diligence report
   * @param {String} file - File path
   * @return updated due diligence
   */
  static async updateDueDiligence(supplierId, doc) {
    const dd = (await this.getLastDueDiligence(supplierId)) || (await this.create({ supplierId }));

    if (doc.files) {
      const oldFiles = dd.files || [];

      doc.files = oldFiles.concat(doc.files);
      doc.fileUploadDate = new Date();
    }

    const company = await Companies.findOne({ _id: supplierId });

    if (!company.isDueDiligenceValidated) {
      await Companies.update({ _id: supplierId }, { $set: { isDueDiligenceEditable: true } });
    }

    const _id = dd._id;

    await this.update(
      { _id },
      {
        $set: doc,
      },
    );

    return this.findOne({ _id });
  }

  /*
   * Remove risk and upload files
   * @param {String} supplierId - company _id
   * @return updated due diligence
   */
  static async removeRisk(supplierId) {
    const { _id } = await this.getLastDueDiligence(supplierId);

    await this.update(
      { _id },
      {
        $unset: {
          fileUploadDate: 1,
          files: 1,
          risk: 1,
        },
      },
    );

    return this.findOne({ _id });
  }

  /*
   * get selected supplier ids
   */
  static async companyIds(selector) {
    if (!selector) return [];

    const selectedItems = await this.find(selector).select('supplierId');

    return selectedItems.map(i => i.supplierId);
  }

  /*
   * Get due diligence duration, amount config for given supplierId
   */
  static async getDueDiligenceConfig(supplierId) {
    const config = await Configs.getConfig();

    let dueDiligenceConfig = config.dueDiligenceDow || {};

    const specific = config.specificPrequalificationDow || {};

    if (specific && specific.supplierIds && specific.supplierIds.includes(supplierId)) {
      dueDiligenceConfig = specific;
    }

    return dueDiligenceConfig;
  }

  /*
   * Reset supplier's due diligence status using config
   * @return - Updated supplier
   */
  static async resetDueDiligence(supplierId) {
    const lastDueDiligence = this.getLastDueDiligence(supplierId) || {};
    const supplierSubmissionDate = lastDueDiligence.supplierSubmissionDate;

    // ignore not supplier submission
    if (!lastDueDiligence || !supplierSubmissionDate) {
      return 'notValidated';
    }

    const { duration, amount } = await this.getDueDiligenceConfig(supplierId);

    const supplier = await Companies.findOne({ _id: supplierId });

    // ignore not validated suppliers
    if (!supplier.isDueDiligenceValidated) {
      return 'notValidated';
    }

    if (moment().diff(supplierSubmissionDate, `${duration}s`) >= amount) {
      // update supplier's
      await Companies.update(
        { _id: supplierId },
        {
          $set: {
            isDueDiligenceValidated: false,
            isDueDiligenceEditable: true,
          },
        },
      );

      // create new due diligence
      return this.createDueDiligence(supplierId);
    }

    return 'dueDateIsNotHere';
  }
}

DueDiligenceSchema.loadClass(DueDiligence);

const DueDiligences = mongoose.model('due_diligences', DueDiligenceSchema);

export default DueDiligences;
