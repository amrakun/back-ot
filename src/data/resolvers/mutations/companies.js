import { Companies } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';
import { sendConfigEmail, putUpdateLog } from '../../../data/utils';
import { LOG_TYPES } from '../../constants';

const companyMutations = {
  async companiesEditCertificateInfo(root, args, { user }) {
    const oldCompany = await Companies.findOne({ _id: user.companyId });
    const updatedCompany = await Companies.updateSection(
      user.companyId,
      'certificateInfo',
      args.certificateInfo,
    );

    const basicInfo = updatedCompany.basicInfo || {};

    // send notification email to supplier
    await sendConfigEmail({
      name: 'capacityBuildingTemplates',
      kind: 'supplier__submit',
      toEmails: [basicInfo.email],
      replacer: text => {
        return text
          .replace('{supplier.name}', basicInfo.enName)
          .replace('{supplier._id}', updatedCompany._id);
      },
    });

    // send notification email to buyer
    const { PREQUALIFICATION_RECEIVER_EMAIL } = process.env;

    await sendConfigEmail({
      name: 'capacityBuildingTemplates',
      kind: 'buyer__submit',
      toEmails: [PREQUALIFICATION_RECEIVER_EMAIL],
      replacer: text => {
        return text
          .replace('{supplier.name}', basicInfo.enName)
          .replace('{supplier._id}', updatedCompany._id);
      },
    });

    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: { certificateInfo: oldCompany.certificateInfo },
        newData: JSON.stringify(args),
        description: `Certificate info of company "${basicInfo.enName}" has been edited`,
      },
      user,
    );

    return updatedCompany;
  },

  async companiesAddDifotScores(root, { difotScores }, { user }) {
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
        const oldScoreDoc = {
          _id: company._id,
          difotScores: [...company.difotScores],
          averageDifotScore: company.averageDifotScore,
        };

        // add new score to every supplier
        const updated = await company.addDifotScore(difotScore.date, difotScore.amount);

        await putUpdateLog(
          {
            type: LOG_TYPES.COMPANY,
            object: oldScoreDoc,
            newData: JSON.stringify({
              difotScores: updated.difotScores,
              averageDifotScore: updated.averageDifotScore,
            }),
            description: `DIFOT score of company "${company.basicInfo.enName}" has been added`,
          },
          user,
        );
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

  /**
   *
   * @param {string} args._id Company id
   * @param {string[]} args.checkedItems
   * @param {string} args.personName
   * @param {string} args.justification
   * @param {string[]} args.files
   */
  async companiesValidateProductsInfo(root, args, { user }) {
    const { _id, checkedItems, personName, justification, files } = args;
    const company = await Companies.findOne({ _id });
    const toBeValidated = await Companies.findOne({ _id });

    const basicInfo = company.basicInfo || { enName: '' };
    const validated = await company.validateProductsInfo({
      checkedItems,
      personName,
      justification,
      files,
    });

    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          _id: company._id,
          productsInfoValidations: toBeValidated.productsInfoValidations,
          isProductsInfoValidated: toBeValidated.isProductsInfoValidated,
          validatedProductsInfo: toBeValidated.validatedProductsInfo,
        },
        newData: JSON.stringify({
          productsInfoValidations: validated.productsInfoValidations,
          isProductsInfoValidated: validated.isProductsInfoValidated,
          validatedProductsInfo: validated.validatedProductsInfo,
        }),
        description: `Company "${basicInfo.enName}" has been validated`,
      },
      user,
    );

    return validated;
  },

  async companiesSendRegistrationInfo(root, args, { user }) {
    const company = await Companies.findOne({ _id: user.companyId });
    const updated = await company.sendRegistrationInfo();

    // write log after updating
    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          isSentRegistrationInfo: company.isSentRegistrationInfo,
          registrationInfoSentDate: company.registrationInfoSentDate,
        },
        newData: JSON.stringify({
          isSentRegistrationInfo: true,
          registrationInfoSentDate: new Date(),
        }),
        description: `"${company.basicInfo.enName}" company has sent registration info`,
      },
      user,
    );

    return updated;
  },

  async companiesSkipPrequalification(root, { reason }, { user }) {
    const company = await Companies.findOne({ _id: user.companyId });
    const skipped = await company.skipPrequalification(reason);

    // write log after updating
    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          isSkippedPrequalification: company.isSkippedPrequalification,
          isSentPrequalificationInfo: company.isSentPrequalificationInfo,
          prequalificationInfoSentDate: company.prequalificationInfoSentDate,
          prequalificationSkippedReason: company.prequalificationSkippedReason,
        },
        newData: JSON.stringify({
          isSkippedPrequalification: true,
          isSentPrequalificationInfo: true,
          prequalificationInfoSentDate: new Date(),
          prequalificationSkippedReason: reason,
        }),
        description: `Prequalification info of company "${
          company.basicInfo.enName
        }" has been skipped`,
      },
      user,
    );

    return skipped;
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

    const updated = await company.sendPrequalificationInfo();

    // fields set at model helper
    const prequalificationInfo = {
      isSentPrequalificationInfo: true,
      isPrequalificationInfoEditable: false,
      prequalificationSubmittedCount: (company.prequalificationSubmittedCount || 0) + 1,
      prequalificationInfoSentDate: new Date(),
    };

    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          isSentPrequalificationInfo: company.isSentPrequalificationInfo,
          isPrequalificationInfoEditable: company.isPrequalificationInfoEditable,
          prequalificationSubmittedCount: company.prequalificationSubmittedCount,
          prequalificationInfoSentDate: company.prequalificationSentDate,
        },
        newData: JSON.stringify(prequalificationInfo),
        description: `Prequalification info of "${company.basicInfo.enName}" has been sent`,
      },
      user,
    );

    return updated;
  },

  async companiesTogglePrequalificationState(root, { supplierId }, { user }) {
    const oldCompany = await Companies.findOne({ _id: supplierId });
    const updatedCompany = await Companies.togglePrequalificationState(supplierId);
    const basicInfo = updatedCompany.basicInfo || {};

    if (updatedCompany.isPrequalificationInfoEditable) {
      await sendConfigEmail({
        name: 'capacityBuildingTemplates',
        kind: 'supplier__enable',
        toEmails: [basicInfo.email],
        replacer: text => {
          return text
            .replace('{supplier.name}', basicInfo.enName)
            .replace('{supplier._id}', updatedCompany._id);
        },
      });
    }

    putUpdateLog(
      {
        type: LOG_TYPES.COMPANY,
        object: {
          isPrequalificationInfoEditable: oldCompany.isPrequalificationInfoEditable,
          isPrequalified: oldCompany.isPrequalified,
        },
        newData: JSON.stringify({
          isPrequalificationInfoEditable: !oldCompany.isPrequalificationInfoEditable,
          isPrequalified: oldCompany.isPrequalified ? false : null,
        }),
        description: `Prequalification state of company "${basicInfo.enName}" has been toggled`,
      },
      user,
    );

    return updatedCompany;
  },

  /**
   *
   * @param {string} args._id Company id
   */
  async companiesValidateDueDiligence(root, args) {
    const validated = await Companies.validateDueDiligence(args._id);

    return validated;
  },

  /**
   *
   * @param {string} args.supplierId Company id
   */
  async companiesEnableRecommendationState(root, { supplierId }) {
    const updatedCompany = await Companies.enableRecommendataionState(supplierId);

    return updatedCompany;
  },

  async companiesAddDueDiligenceRisk(root, { supplierId, ...doc }, { user }) {
    const company = await Companies.findOne({ _id: supplierId });
    const updatedCompany = await company.updateDueDiligence(doc, user);

    return updatedCompany;
  },
};

const sections = [
  'basic',
  'contact',
  'managementTeam',
  'shareholder',
  'group',
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
  const subFieldName = `${section}Info`;

  /**
   * @param {Object} args Object containing subField data
   */
  companyMutations[name] = async (root, args, { user }) => {
    const company = await Companies.findOne({ _id: user.companyId });
    const updated = await Companies.updateSection(user.companyId, subFieldName, args[subFieldName]);

    let companyName = '';

    if (company && company.basicInfo && company.basicInfo.enName) {
      companyName = company.basicInfo.enName;
    }

    // company name doesn't exist when being registered for the first time
    if (!company && subFieldName === 'basicInfo') {
      companyName = args.basicInfo.enName;
    }

    if (company && updated) {
      putUpdateLog(
        {
          type: LOG_TYPES.COMPANY,
          object: { [subFieldName]: company[subFieldName] },
          newData: JSON.stringify({ [subFieldName]: args[subFieldName] }),
          description: `"${companyName}" has been edited`,
        },
        user,
      );
    }

    return updated;
  };

  requireSupplier(companyMutations, name);
});

const recommendationSections = ['shareholder', 'basic', 'managementTeam', 'group'];

recommendationSections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);
  const name = `recommendationsSave${capsedName}Info`;
  const subFieldName = `${section}Info`;

  /**
   * @param {Object} args Object containing subField data
   */
  companyMutations[name] = async (root, args) => {
    const updated = await Companies.updateSection(args._id, subFieldName, args[subFieldName], true);

    return updated;
  };

  requireBuyer(companyMutations, name);
});

requireSupplier(companyMutations, 'companiesEditCertificateInfo');
requireSupplier(companyMutations, 'companiesSendRegistrationInfo');
requireSupplier(companyMutations, 'companiesSendPrequalificationInfo');
requireSupplier(companyMutations, 'companiesSkipPrequalification');

requireBuyer(companyMutations, 'companiesAddDifotScores');
requireBuyer(companyMutations, 'companiesAddDueDiligences');
requireBuyer(companyMutations, 'companiesValidateProductsInfo');
requireBuyer(companyMutations, 'companiesTogglePrequalificationState');

export default companyMutations;
