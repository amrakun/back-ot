import { Configs } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';
import { resetConfigCache } from '../../utils';

const configMutations = {
  // save basic info
  async configsSaveBasicInfo(root, args) {
    const response = await Configs.saveBasicInfo(args);

    resetConfigCache();

    return response;
  },

  // save template
  async configsSaveTemplate(root, doc) {
    const response = await Configs.saveTemplate(doc);

    resetConfigCache();

    return response;
  },

  // save prequalification duration of warranty
  async configsSavePrequalificationDow(root, { doc }) {
    const response = await Configs.savePrequalificationDow(doc);

    resetConfigCache();

    return response;
  },

  // save due diligence duration of warranty
  async configsSaveDueDiligenceDow(root, { doc }) {
    const response = await Configs.saveDueDiligenceDow(doc);

    resetConfigCache();

    return response;
  },

  // save audit duration of warranty
  async configsSaveAuditDow(root, { doc }) {
    const response = await Configs.saveAuditDow(doc);

    resetConfigCache();

    return response;
  },

  // save improvementPlan duration of warranty
  async configsSaveImprovementPlanDow(root, { doc }) {
    const response = await Configs.saveImprovementPlanDow(doc);

    resetConfigCache();

    return response;
  },
};

moduleRequireBuyer(configMutations);

export default configMutations;
