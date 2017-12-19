import { Companies } from '../../../db/models';
import { requireLogin } from '../../permissions';

const companyMutations = {
  companiesEditBasicInfo(root, { _id, basicInfo }) {
    return Companies.updateBasicInfo(_id, basicInfo);
  },
};

const sections = [
  'contact',
  'managementTeam',
  'shareholder',
  'group',
  'certificate',
  'products',
  'financial',
  'business',
  'environmental',
  'health',
];

sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);
  const name = `companiesEdit${capsedName}Info`;

  companyMutations[name] = (root, args, { user }) => {
    return Companies.updateSection(user.companyId, `${section}Info`, args[`${section}Info`]);
  };

  requireLogin(companyMutations, name);
});

export default companyMutations;
