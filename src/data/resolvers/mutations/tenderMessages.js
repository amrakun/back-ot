import { TenderMessages, Tenders, Users, Companies } from '../../../db/models';
import { putCreateLog } from '../../utils';
import { requireSupplier, requireBuyer } from '../../permissions';
import tenderUtils from '../../tenderUtils';
import { LOG_TYPES } from '../../constants';

const tenderMessageMutations = {
  async tenderMessageBuyerSend(root, args, { user }) {
    const tenderMessage = await TenderMessages.tenderMessageBuyerSend(args, user);

    const { tenderId, eoiTargets } = args;

    let supplierIds = args.recipientSupplierIds;

    const tender = await Tenders.findOne({ _id: tenderId });

    if (tender.type === 'eoi') {
      if (eoiTargets === 'toAll') {
        supplierIds = await tender.getExactSupplierIds();
      }

      if (eoiTargets === 'toParticipated') {
        supplierIds = await tender.participatedSuppliers({ onlyIds: true });
      }
    }

    const supplierNames = await tenderUtils.gatherSupplierNames(
      supplierIds,
      'recipientSupplierIds',
    );

    tenderUtils
      .sendEmailToSuppliers({
        kind: 'supplier__message_notification',
        tender,
        supplierIds,
      })
      .then(() => {
        console.log('Successfully sent');
      })
      .catch(e => {
        console.log(`Error while sending tender message emails ${tenderId}: ${e.message}`);
      });

    if (tender) {
      putCreateLog(
        {
          type: LOG_TYPES.TENDER_MESSAGE,
          object: tenderMessage,
          newData: JSON.stringify({ ...args, senderBuyerId: user._id }),
          description: `Message has been created for tender "${
            tender.name
          }" of type "${tender.type.toUpperCase()}"`,
          extraDesc: JSON.stringify([
            ...supplierNames,
            { senderBuyerId: user._id, name: `${user.firstName} ${user.lastName}` },
            { tenderId: tender._id, name: `${tender.name} (${tender.number})` },
          ]),
        },
        user,
      );
    }

    return tenderMessage;
  },

  async tenderMessageSupplierSend(root, args, { user }) {
    const tenderMessage = await TenderMessages.tenderMessageSupplierSend(args, user);
    const tender = await Tenders.findOne({ _id: args.tenderId });
    const buyers = await Users.find({ _id: { $in: tender.responsibleBuyerIds || [] } });
    const companyName = await Companies.getName(user.companyId);

    await tenderUtils.sendEmailToBuyer({
      kind: 'buyer__message_notification',
      tender,
      extraBuyerEmails: buyers.map(buyer => buyer.email),
    });

    putCreateLog(
      {
        type: LOG_TYPES.TENDER_MESSAGE,
        object: tenderMessage,
        newData: JSON.stringify({ ...args, senderSupplierId: user.companyId }),
        description: `Message has been created for tender ${
          tender.name
        } of type "${tender.type.toUpperCase()}"`,
        extraDesc: JSON.stringify([
          { senderSupplierId: user.companyId, name: companyName },
          { tenderId: tender._id, name: `${tender.name} (${tender.number})` },
        ]),
      },
      user,
    );

    return tenderMessage;
  },

  async tenderMessageSetAsRead(root, args, { user }) {
    return TenderMessages.tenderMessageSetAsRead(args, user);
  },
};

requireBuyer(tenderMessageMutations, 'tenderMessageBuyerSend');
requireSupplier(tenderMessageMutations, 'tenderMessageSupplierSend');

export default tenderMessageMutations;
