import { Audits, AuditResponses } from '../../../db/models';
import { requireSupplier, requireBuyer } from '../../permissions';

const auditMutations = {
  // create new audit
  auditsAdd(root, { date, supplierIds }, { user }) {
    return Audits.createAudit({ date, supplierIds }, user._id);
  },

  // save basic info
  auditsSupplierSaveBasicInfo(root, { auditId, supplierId, basicInfo }) {
    return AuditResponses.saveBasicInfo({ auditId: auditId, supplierId, doc: basicInfo });
  },

  // save evidence info
  auditsSupplierSaveEvidenceInfo(root, { auditId, supplierId, evidenceInfo }) {
    return AuditResponses.saveEvidenceInfo({ auditId: auditId, supplierId, doc: evidenceInfo });
  },
};

const sections = ['coreHseqInfo', 'hrInfo', 'businessInfo'];

// create section mutations ===========
sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  const mutation = (root, args) => {
    return AuditResponses.saveReplyRecommentSection({
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

requireBuyer(auditMutations, 'auditsAdd');
requireSupplier(auditMutations, 'auditsSupplierSaveBasicInfo');
requireSupplier(auditMutations, 'auditsSupplierSaveEvidenceInfo');

export default auditMutations;
