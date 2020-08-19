import { DueDiligences, Companies } from '../../../db/models';
import { requireBuyer } from '../../permissions';
import { putUpdateLog } from '../../../data/utils';
import { LOG_TYPES } from '../../constants';

const dueDiligenceMutations = {
  /**
   *
   * @param {string} args.supplierId Company id
   */
  async dueDiligencesSave(root, args, { user }) {
    return DueDiligences.saveDueDiligence(args, user);
  },

  /**
   *
   * @param {string} args.supplierId Company id
   */
  async dueDiligencesCancel(root, args) {
    return DueDiligences.cancelDueDiligence(args);
  },

  /**
   *
   * @param {string} args.supplierId Company id
   */
  async dueDiligencesEnableState(root, { supplierId }) {
    const updatedCompany = await DueDiligences.enableRecommendataionState(supplierId);

    return updatedCompany;
  },

  async dueDiligencesUpdate(root, { supplierId, ...doc }) {
    return DueDiligences.updateDueDiligence(supplierId, doc);
  },

  async dueDiligencesRemoveRisk(root, { supplierId }) {
    return DueDiligences.removeRisk(supplierId);
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
      const company = await Companies.findOne({ _id: supplierId });

      let companyName = '';

      if (company && company.basicInfo && company.basicInfo.enName) {
        companyName = company.basicInfo.enName;
      }

      console.log(LOG_TYPES.DUE_DILIGENCE);
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
