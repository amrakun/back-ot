/* eslint-disable no-console */

/*
 * Task : Run Server and fetch multiple emails from DB to send reminder
 * Invoke all the email task at once and update DB once the email is sent
 */

import { requireBuyer } from '../../permissions';
import { sendEmail } from '../../utils';
import { Companies } from '../../../db/models';

const mutations = {
  /*
   * Send mass email
   */
  async massMailsSend(root, { supplierIds, subject, content }) {
    const { FROM_EMAIL_MASS } = process.env;

    // send email to every supplier
    for (const supplierId of supplierIds) {
      const supplier = await Companies.findOne({ _id: supplierId });
      const email = supplier.basicInfo && supplier.basicInfo.email;

      // send email
      sendEmail({
        fromEmail: FROM_EMAIL_MASS,
        toEmails: [email],
        subject,
        content,
        data: { source: 'massMail' },
      });
    }
  },
};

requireBuyer(mutations, 'massMailsSend');

export default mutations;
