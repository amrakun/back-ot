import { Companies } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';

const companyMutations = {
  companiesEditBasicInfo(root, { _id, basicInfo }) {
    return Companies.updateBasicInfo(_id, basicInfo);
  },

  async companiesAddDifotScores(root, { difotScores }) {
    for (let difotScore of difotScores) {
      let company = await Companies.findOne({ 'basicInfo.enName': difotScore.supplierName });

      if (!company) {
        company = await Companies.findOne({ 'basicInfo.mnName': difotScore.supplierName });
      }

      if (company) {
        // add new score to every supplier
        await company.addDifotScore(difotScore.date, difotScore.amount);
      }
    }
  },

  async companiesAddDueDiligences(root, { dueDiligences }) {
    for (let dueDiligence of dueDiligences) {
      const company = await Companies.findOne({ _id: dueDiligence.supplierId });

      // add new due diligence report to every supplier
      await company.addDueDiligence(dueDiligence.file);
    }
  },

  async companiesValidateProductsInfo(root, { _id, codes }) {
    const company = await Companies.findOne({ _id });

    return company.validateProductsInfo(codes);
  },

  async companiesSendRegistrationInfo(root, { _id }) {
    const company = await Companies.findOne({ _id });

    return company.sendRegistrationInfo();
  },

  async companiesSendPrequalificationInfo(root, { _id }) {
    const company = await Companies.findOne({ _id });

    return company.sendPrequalificationInfo();
  },
};
const sections = [
  'basic',
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

  requireSupplier(companyMutations, name);
});

requireSupplier(companyMutations, 'companiesSendRegistrationInfo');
requireSupplier(companyMutations, 'companiesSendPrequalificationInfo');

requireBuyer(companyMutations, 'companiesAddDifotScores');
requireBuyer(companyMutations, 'companiesAddDueDiligences');
requireBuyer(companyMutations, 'companiesValidateProductsInfo');

export default companyMutations;
