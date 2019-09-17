import { TenderResponses, TenderResponseLogs, Tenders } from '../../../db/models';
import { moduleRequireSupplier } from '../../permissions';
import { putCreateLog, putUpdateLog } from '../../utils';
import { LOG_TYPES } from '../../constants';

const tenderResponseMutations = {
  /**
   * Creates a new tender response
   * @param {Object} doc - tender response fields
   * @returns {Promise} newly created tender reponse object
   */
  async tenderResponsesAdd(root, doc, { user }) {
    const tender = await Tenders.findOne({ _id: doc.tenderId });
    const response = (await TenderResponses.createTenderResponse({
      ...doc,
      supplierId: user.companyId,
    })).toObject();

    if (response && tender) {
      putCreateLog(
        {
          type: LOG_TYPES.TENDER_RESPONSE,
          object: response,
          newData: JSON.stringify(response),
          description: `Response for tender "${
            tender.name
          }" of type "${tender.type.toUpperCase()}" has been created`,
        },
        user,
      );
    }

    return response;
  },

  /**
   * Updates an existing tender response
   * @param {Object} doc - tender response fields
   * @returns {Promise} updated tender reponse object
   */
  async tenderResponsesEdit(root, doc, { user }) {
    const oldResponse = await TenderResponses.findBySupplierId({
      tenderId: doc.tenderId,
      supplierId: user.companyId,
    });

    const updatedResponse = await TenderResponses.updateTenderResponse({
      ...doc,
      supplierId: user.companyId,
    });
    const tender = await Tenders.findOne({ _id: doc.tenderId });

    if (oldResponse && tender) {
      putUpdateLog(
        {
          type: LOG_TYPES.TENDER_RESPONSE,
          object: oldResponse,
          newData: JSON.stringify(doc),
          description: `Response has been edited for tender "${
            tender.name
          }" of type "${tender.type.toUpperCase()}"`,
        },
        user,
      );
    }

    return updatedResponse;
  },

  /**
   * Marks tender response as sent
   * @param {string} doc.supplierId Supplier id
   * @param {string} doc.tenderId Tender id
   */
  async tenderResponsesSend(root, doc, { user }) {
    const oldResponse = await TenderResponses.findBySupplierId(doc);
    const tender = await Tenders.findOne({ _id: doc.tenderId });

    if (oldResponse && tender) {
      const updatedResponse = await oldResponse.send();

      putUpdateLog(
        {
          type: LOG_TYPES.TENDER_RESPONSE,
          object: {
            status: oldResponse.status,
            isSent: oldResponse.isSent,
            sentDate: oldResponse.sentDate,
          },
          newData: JSON.stringify({
            status: updatedResponse.status,
            isSent: updatedResponse.isSent,
            sentDate: updatedResponse.sentDate,
          }),
          description: `Response for tender "${
            tender.name
          }" of type "${tender.type.toUpperCase()}" has been edited`,
        },
        user,
      );

      return updatedResponse;
    }

    await TenderResponseLogs.createLog(oldResponse, user._id);

    return null;
  },
};

moduleRequireSupplier(tenderResponseMutations);

export default tenderResponseMutations;
