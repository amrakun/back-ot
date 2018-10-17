import { Qualifications, Companies, Configs } from '../../../db/models';
import { generateReplacer } from '../mutations/qualifications';
import { requireBuyer, requireSupplier } from '../../permissions';

const qualificationQueries = {
  /**
   * Qualification detail
   */
  qualificationDetail(root, { supplierId }) {
    return Qualifications.findOne({ supplierId });
  },

  /**
   * Qualification prequalification replacer
   */
  async qualificationPrequalificationReplacer(root, { supplierId }) {
    const supplier = await Companies.findOne({ _id: supplierId });

    const replacer = await generateReplacer(supplier, false);

    const config = await Configs.getConfig();
    const templates = config.prequalificationTemplates || {};
    const template = templates.supplier__failed || {};

    const { from, subject = {}, content = {} } = template;

    return {
      from,
      subject: {
        en: replacer(subject.en || ''),
        mn: replacer(subject.mn || ''),
      },
      content: {
        en: replacer(content.en || ''),
        mn: replacer(content.mn || ''),
      },
    };
  },

  /**
   * Qualification detail by logged in user
   */
  qualificationDetailByUser(root, args, { user }) {
    return Qualifications.findOne({ supplierId: user.companyId });
  },
};

requireBuyer(qualificationQueries, 'qualificationPrequalificationReplacer');
requireBuyer(qualificationQueries, 'qualificationDetail');
requireSupplier(qualificationQueries, 'qualificationDetailByUser');

export default qualificationQueries;
