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

export default auditMutations;
