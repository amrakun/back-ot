import mongoose from 'mongoose';
import { field, isEmpty, generateSearchText } from './utils';
import { FileSchema } from './Companies';
import { Companies } from './';
import {
  basicInfoFieldNames,
  shareholderFieldNames,
  personFieldNames,
  groupInfoFieldNames,
  searchFieldNames,
} from './constants';

const generateFields = names => {
  const definitions = {};

  for (let name of names) {
    definitions[name] = field({
      type: String,
      optional: true,
    });
  }

  return mongoose.Schema(definitions, { _id: false });
};

export const SearchTextSchema = generateFields(searchFieldNames);

export const DueDiligenceSchema = mongoose.Schema({
  supplierId: field({ type: String, label: 'Supplier' }),

  files: field({ type: [FileSchema], label: 'File', optional: true }),
  createdUserId: field({ type: String, label: 'Created user', optional: true }),
  fileUploadDate: field({ type: Date, label: 'File upload date', optional: true }),

  date: field({ type: Date, label: 'Date', optional: true }),
  closeDate: field({ type: Date, label: 'Close date', optional: true }),
  supplierSubmissionDate: field({ type: Date, label: 'Supplier submission date', optional: true }),
  risk: field({ type: String, label: 'Risk', optional: true }),

  reminderDay: field({ type: Number, optional: true, label: 'Reminder day' }),

  basicInfo: generateFields(basicInfoFieldNames),
  shareholderInfo: {
    shareholders: [generateFields(shareholderFieldNames)],
  },
  managementTeamInfo: {
    managingDirector: generateFields(personFieldNames),
    executiveOfficer: generateFields(personFieldNames),
  },
  groupInfo: generateFields(groupInfoFieldNames),
  searchText: SearchTextSchema,
});

class DueDiligence {
  static getLastDueDiligence(supplierId) {
    return this.findOne({ supplierId }).sort({ createDate: 1 });
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
  static async saveDueDiligence({ supplierId }, user) {
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

          if (!isEmpty(recommendations[key], isParent)) return false;
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
   * @param String _id - Company id
   * @return updated company
   */
  static async cancelDueDiligence({ supplierId }) {
    const _id = supplierId;

    // update fields
    await Companies.update(
      { _id },
      {
        $set: {
          isDueDiligenceValidated: false,
        },
      },
    );

    return Companies.findOne({ _id });
  }

  static async enableRecommendataionState(_id) {
    await Companies.findOne({ _id });

    const updateQuery = {
      $set: {
        isDueDiligenceEditable: true,
      },
    };

    updateQuery.$unset = { isDueDiligenceValidated: 1, recommendations: 1 };

    await Companies.update({ _id }, updateQuery);

    return Companies.findOne({ _id });
  }

  /*
   * Add new due diligence report
   * @param {String} file - File path
   * @return updated due diligence
   */
  static async updateDueDiligence(supplierId, doc) {
    const dd = await this.getLastDueDiligence(supplierId);

    if (!dd) {
      await this.create({ supplierId, doc });

      return this.findOne({ supplierId });
    }

    if (doc.files) {
      doc.files = dd.files ? dd.files.concat(doc.files) : doc.files;

      doc.fileUploadDate = new Date();
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
}

DueDiligenceSchema.loadClass(DueDiligence);

const DueDiligences = mongoose.model('due_diligences', DueDiligenceSchema);

export default DueDiligences;
