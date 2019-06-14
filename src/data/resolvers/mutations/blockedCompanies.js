import { Companies, BlockedCompanies } from '../../../db/models';
import { sendConfigEmail } from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';

const blockedCompanyMutations = {
  async blockedCompaniesBlock(root, { supplierIds, ...doc }, { user }) {
    doc.groupId = Math.random().toString();

    let supNames = '';

    for (let supplierId of supplierIds) {
      const sup = await Companies.findOne({ _id: supplierId });

      supNames = `${supNames} ${supNames ? ',' : ''} ${sup.basicInfo.enName}`;

      await BlockedCompanies.block({ supplierId, ...doc }, user._id);
    }

    const { BLOCK_NOTIFICATIONS_EMAILS = '' } = process.env;

    await sendConfigEmail({
      name: 'blockTemplates',
      kind: 'buyer__block',
      toEmails: [BLOCK_NOTIFICATIONS_EMAILS.split(',')],
      replacer: text => {
        return text
          .replace('{startDate}', doc.startDate.toLocaleString())
          .replace('{endDate}', doc.endDate.toLocaleString())
          .replace('{supplierNames}', supNames);
      },
    });
  },

  async blockedCompaniesUnblock(root, { supplierIds }) {
    for (let supplierId of supplierIds) {
      await BlockedCompanies.unblock(supplierId);
    }
  },
};

moduleRequireBuyer(blockedCompanyMutations);

export default blockedCompanyMutations;
