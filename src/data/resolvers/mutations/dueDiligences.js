import { DueDiligences } from '../../../db/models';
import { requireBuyer } from '../../permissions';

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
  dueDiligenceMutations[name] = async (root, args) => {
    const updated = await DueDiligences.updateSection(
      args.supplierId,
      subFieldName,
      args[subFieldName],
    );

    return updated;
  };

  requireBuyer(dueDiligenceMutations, name);
});

export default dueDiligenceMutations;
