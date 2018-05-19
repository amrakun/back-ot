import { Configs } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const configMutations = {
  // save basic info
  configsSaveBasicInfo(root, args) {
    return Configs.saveBasicInfo(args);
  },

  // save template
  configsSaveTemplate(root, doc) {
    return Configs.saveTemplate(doc);
  },

  // save prequalification duration of warranty
  configsSavePrequalificationDow(root, { doc }) {
    return Configs.savePrequalificationDow(doc);
  },

  // save audit duration of warranty
  configsSaveAuditDow(root, { doc }) {
    return Configs.saveAuditDow(doc);
  },

  // save improvementPlan duration of warranty
  configsSaveImprovementPlanDow(root, { doc }) {
    return Configs.saveImprovementPlanDow(doc);
  },
};

moduleRequireBuyer(configMutations);

export default configMutations;
