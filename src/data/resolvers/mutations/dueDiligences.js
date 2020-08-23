import { DueDiligences, Companies } from '../../../db/models';
import { requireBuyer } from '../../permissions';
import { putUpdateLog, putDeleteLog } from '../../../data/utils';
import { LOG_TYPES } from '../../constants';

// get company name
const getCompanyName = async supplierId => {
  const company = await Companies.findOne({ _id: supplierId });

  if (company && company.basicInfo) {
    const { enName, mnName } = company.basicInfo;

    return enName || mnName;
  }

  return ' - ';
};

const dueDiligenceMutations = {
  /**
   *
   * @param {string} args.supplierId Company id
   */
  async dueDiligencesSave(root, { supplierId }, { user }) {
    const company = await Companies.findOne({ _id: supplierId });

    const companyName = company.basicInfo && company.basicInfo.enName;
    const updated = await DueDiligences.saveDueDiligence(supplierId, user);

    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          isDueDiligenceValidated: company.isDueDiligenceValidated,
        },
        newData: JSON.stringify({
          isDueDiligenceValidated: updated.isDueDiligenceValidated,
        }),
        description: `Due diligence of company "${companyName}" has been validated`,
      },
      user,
    );

    return updated;
  },

  /**
   *
   * @param {string} args.supplierId Company id
   */
  async dueDiligencesCancel(root, { supplierId }, { user }) {
    const company = await Companies.findOne({ _id: supplierId });
    const companyName = company.basicInfo && company.basicInfo.enName;

    const doc = {
      isDueDiligenceEditable: company.isDueDiligenceEditable,
      isDueDiligenceValidated: company.isDueDiligenceValidated,
    };

    putDeleteLog(
      {
        type: LOG_TYPES.COMPANY,
        object: doc,
        newData: JSON.stringify(doc),
        description: `Due diligence of company "${companyName}" has been canceled`,
      },
      user,
    );

    return DueDiligences.cancelDueDiligence(supplierId);
  },

  /**
   *
   * @param {string} args.supplierId Company id
   */
  async dueDiligencesEnableState(root, { supplierId }, { user }) {
    const company = await Companies.findOne({ _id: supplierId });
    const updatedCompany = await DueDiligences.enableDueDiligence(supplierId);
    const companyName = company.basicInfo && company.basicInfo.enName;

    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          isDueDiligenceEditable: company.isDueDiligenceEditable,
          isDueDiligenceValidated: company.isDueDiligenceValidated,
        },
        newData: JSON.stringify({
          isDueDiligenceEditable: updatedCompany.isDueDiligenceEditable,
          isDueDiligenceValidated: updatedCompany.isDueDiligenceValidated,
        }),
        description: `Due diligence of company "${companyName}" has been enabled`,
      },
      user,
    );

    return updatedCompany;
  },

  async dueDiligencesUpdate(root, { supplierId, ...doc }, { user }) {
    const dd = await DueDiligences.getLastDueDiligence(supplierId);
    const updated = await DueDiligences.updateDueDiligence(supplierId, doc);
    const companyName = await getCompanyName(supplierId);

    const oldData = {};
    Object.keys(doc).map(key => {
      oldData[key] = dd[key];
    });

    putUpdateLog(
      {
        type: LOG_TYPES.DUE_DILIGENCE,
        object: oldData,
        newData: JSON.stringify(doc),
        description: `"${companyName}" company has been edited`,
      },
      user,
    );

    return updated;
  },

  async dueDiligencesRemoveRisk(root, { supplierId }, { user }) {
    const dd = await DueDiligences.getLastDueDiligence(supplierId);
    const updated = await DueDiligences.removeRisk(supplierId);
    const companyName = await getCompanyName(supplierId);

    const oldScoreDoc = {
      risk: dd.risk,
      fileUploadDate: dd.fileUploadDate,
    };

    putDeleteLog(
      {
        type: LOG_TYPES.DUE_DILIGENCE,
        object: oldScoreDoc,
        newData: JSON.stringify({
          risk: updated.risk,
          fileUploadDate: updated.fileUploadDate,
        }),
        description: `"${companyName}" company has clear risk value`,
      },
      user,
    );

    return updated;
  },
};

const sections = ['shareholder', 'basic', 'managementTeam', 'group'];

sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);
  const name = `dueDiligencesSave${capsedName}Info`;
  const subFieldName = `${section}Info`;

  /**
   * @param {Object} args Object containing subField data
   */
  dueDiligenceMutations[name] = async (root, args, { user }) => {
    const supplierId = args.supplierId;

    const dd = await DueDiligences.getLastDueDiligence(supplierId);
    const updated = await DueDiligences.updateSection(supplierId, subFieldName, args[subFieldName]);

    if (dd && updated) {
      const companyName = await getCompanyName(supplierId);

      putUpdateLog(
        {
          type: LOG_TYPES.DUE_DILIGENCE,
          object: { [subFieldName]: dd[subFieldName] },
          newData: JSON.stringify({ [subFieldName]: args[subFieldName] }),
          description: `"${companyName}" has been edited`,
        },
        user,
      );
    }

    return updated;
  };

  requireBuyer(dueDiligenceMutations, name);
});

requireBuyer(dueDiligenceMutations, 'dueDiligencesSave');
requireBuyer(dueDiligenceMutations, 'dueDiligencesCancel');
requireBuyer(dueDiligenceMutations, 'dueDiligencesEnableState');
requireBuyer(dueDiligenceMutations, 'dueDiligencesUpdate');
requireBuyer(dueDiligenceMutations, 'dueDiligencesRemoveRisk');

export default dueDiligenceMutations;
