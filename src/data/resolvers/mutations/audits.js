import { Audits } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';

const auditMutations = {};

const sections = ['coreHseqInfo', 'hrInfo', 'businessInfo'];

sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  const mutation = (root, args) => {
    return Audits.saveReplyRecommentSection({
      auditId: args.auditId,
      supplierId: args.supplierId,
      name: section,
      doc: args[section],
    });
  };

  // supplier mutation
  const supplierName = `auditsSupplierSave${capsedName}`;
  auditMutations[supplierName] = mutation;
  requireSupplier(auditMutations, supplierName);

  // buyer mutation
  const buyerName = `auditsBuyerSave${capsedName}`;
  auditMutations[buyerName] = mutation;
  requireBuyer(auditMutations, buyerName);
});

// save basic info
auditMutations.auditsSupplierSaveBasicInfo = (root, { auditId, supplierId, basicInfo }) => {
  return Audits.saveBasicInfo({ auditId: auditId, supplierId, doc: basicInfo });
};

// save evidence info
auditMutations.auditsSupplierSaveEvidenceInfo = (root, { auditId, supplierId, evidenceInfo }) => {
  return Audits.saveEvidenceInfo({ auditId: auditId, supplierId, doc: evidenceInfo });
};

requireSupplier(auditMutations, 'auditsSupplierSaveBasicInfo');
requireSupplier(auditMutations, 'auditsSupplierSaveEvidenceInfo');

export default auditMutations;
