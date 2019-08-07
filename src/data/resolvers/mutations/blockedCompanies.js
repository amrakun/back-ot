import { Companies, BlockedCompanies } from '../../../db/models';
import { sendConfigEmail } from '../../../data/utils';
import { moduleRequireBuyer } from '../../permissions';
import { putCreateLog, putDeleteLog } from '../../utils';

const blockedCompanyMutations = {
  async blockedCompaniesBlock(root, { supplierIds, ...doc }, { user }) {
    doc.groupId = Math.random().toString();

    let supNames = '';

    for (let supplierId of supplierIds) {
      const sup = await Companies.findOne({ _id: supplierId });
      const blockedCompany = await BlockedCompanies.findOne({ supplierId });

      supNames = `${supNames} ${supNames ? ',' : ''} ${sup.basicInfo.enName}`;

      await BlockedCompanies.block({ supplierId, ...doc }, user._id);

      if (blockedCompany) {
        await putCreateLog(
          {
            type: 'blockedCompany',
            object: blockedCompany,
            newData: JSON.stringify({ supplierId, ...doc }),
            description: `Company "${sup.basicInfo.enName}" has been blocked`,
          },
          user,
        );
      }
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

  /**
   * Unblocks list of companies
   * @param {string[]} param.supplierIds Supplier ids to be unblocked
   */
  async blockedCompaniesUnblock(root, { supplierIds }, { user }) {
    for (let supplierId of supplierIds) {
      const blocked = await BlockedCompanies.findOne({ supplierId });
      const supplier = await Companies.findOne({ _id: supplierId });

      await BlockedCompanies.unblock(supplierId);

      if (supplier && supplier.basicInfo) {
        await putDeleteLog(
          {
            type: 'blockedCompany',
            object: blocked,
            description: `Company "${supplier.basicInfo.enName}" has been unblocked`,
          },
          user,
        );
      }
    } // end supplier loop
  },
};

moduleRequireBuyer(blockedCompanyMutations);

export default blockedCompanyMutations;
