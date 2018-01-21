import { Qualifications } from '../../../db/models';
import { requireBuyer } from '../../permissions';

const qualificationMutations = {
  /*
   * Save tier type
   */
  qualificationsSaveTierType(root, { supplierId, tierType }) {
    return Qualifications.saveTierType(supplierId, 'tierType', tierType);
  },
};

const sections = ['financial', 'business', 'environmental', 'health'];

sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  const name = `qualificationsSave${capsedName}Info`;
  const sectionName = `${section}Info`;

  qualificationMutations[name] = (root, args) => {
    const value = args[`${section}Info`];
    return Qualifications.updateSection(args.supplierId, sectionName, value);
  };

  requireBuyer(qualificationMutations, name);
});

requireBuyer(qualificationMutations, 'qualificationsSaveTierType');

export default qualificationMutations;
