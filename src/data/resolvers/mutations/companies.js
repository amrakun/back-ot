import { Companies } from '../../../db/models';

const companyMutations = {
  companiesEditBasicInfo(root, { _id, basicInfo }) {
    return Companies.updateBasicInfo(_id, basicInfo);
  }
};

const sections = [
  'contact', 'managementTeam', 'shareholder', 'group', 'certificate',
  'products', 'financial', 'business', 'environmental', 'health'
];

sections.forEach((section) => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  companyMutations[`companiesEdit${capsedName}Info`] = (root, args) => {
    return Companies.updateSection(args._id, `${section}Info`, args[`${section}Info`]);
  }
});

export default companyMutations;
