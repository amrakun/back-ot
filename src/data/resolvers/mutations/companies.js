import { Companies } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import { sendConfigEmail } from '../../../data/utils';

const companyMutations = {
  async companiesAddDifotScores(root, { difotScores }) {
    for (let difotScore of difotScores) {
      let company = await Companies.findOne({
        'basicInfo.enName': difotScore.supplierName,
      });

      if (!company) {
        company = await Companies.findOne({
          'basicInfo.mnName': difotScore.supplierName,
        });
      }

      if (company) {
        // add new score to every supplier
        await company.addDifotScore(difotScore.date, difotScore.amount);
      }
    }
  },

  async companiesAddDueDiligences(root, { dueDiligences }, { user }) {
    for (let dueDiligence of dueDiligences) {
      const company = await Companies.findOne({ _id: dueDiligence.supplierId });

      // add new due diligence report to every supplier
      await company.addDueDiligence(dueDiligence, user);
    }
  },

  async companiesValidateProductsInfo(root, args) {
    const { _id, checkedItems, personName, justification, files } = args;

    const company = await Companies.findOne({ _id });

    return company.validateProductsInfo({
      checkedItems,
      personName,
      justification,
      files,
    });
  },

  async companiesSendRegistrationInfo(root, args, { user }) {
    const company = await Companies.findOne({ _id: user.companyId });

    return company.sendRegistrationInfo();
  },

  async companiesSkipPrequalification(root, { reason }, { user }) {
    const company = await Companies.findOne({ _id: user.companyId });

    return company.skipPrequalification(reason);
  },

  async companiesSendPrequalificationInfo(root, args, { user }) {
    const company = await Companies.findOne({ _id: user.companyId });

    // send notification email to supplier
    await sendConfigEmail({
      name: 'prequalificationTemplates',
      kind: 'supplier__submit',
      toEmails: [company.basicInfo.email],
    });

    // send notification email to buyer
    const { PREQUALIFICATION_RECEIVER_EMAIL } = process.env;

    await sendConfigEmail({
      name: 'prequalificationTemplates',
      kind: 'buyer__submit',
      toEmails: [PREQUALIFICATION_RECEIVER_EMAIL],
      replacer: text => {
        return text
          .replace('{supplier.name}', company.basicInfo.enName)
          .replace('{supplier._id}', company._id);
      },
    });

    return company.sendPrequalificationInfo();
  },

  companiesTogglePrequalificationState(root, { supplierId }) {
    return Companies.togglePrequalificationState(supplierId);
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
requireSupplier(companyMutations, 'companiesSkipPrequalification');

requireBuyer(companyMutations, 'companiesAddDifotScores');
requireBuyer(companyMutations, 'companiesAddDueDiligences');
requireBuyer(companyMutations, 'companiesValidateProductsInfo');
requireBuyer(companyMutations, 'companiesTogglePrequalificationState');

export default companyMutations;
