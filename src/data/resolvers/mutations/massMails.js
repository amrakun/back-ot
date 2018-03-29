/* eslint-disable no-console */

/*
 * Task : Run Server and fetch multiple emails from DB to send reminder
 * Invoke all the email task at once and update DB once the email is sent
 */

import { requireBuyer } from '../../permissions';
import { createTransporter } from '../../utils';
import { Companies, MassMails } from '../../../db/models';

const mutations = {
  /*
   * Send mass email
   */
  async massMailsSend(root, { supplierIds, subject, content }, { user }) {
    const { FROM_EMAIL_MASS } = process.env;

    // create mass email entry
    const entryId = await MassMails.send(
      {
        supplierIds,
        subject,
        content,
      },

      user._id,
    );

    const transporter = await createTransporter();

    // send email to every supplier
    for (const supplierId of supplierIds) {
      const supplier = await Companies.findOne({ _id: supplierId });
      const email = supplier.basicInfo && supplier.basicInfo.email;

      // set status to pending
      await MassMails.update({ _id: entryId }, { $set: { [`status.${supplierId}`]: 'pending' } });

      // send email
      const mailOptions = {
        from: FROM_EMAIL_MASS,
        to: email,
        subject,
        html: content,
      };

      transporter.sendMail(mailOptions, async error => {
        console.log(error);

        const status = error ? 'failed' : 'sent';

        // set status
        await MassMails.update({ _id: entryId }, { $set: { [`status.${supplierId}`]: status } });
      });
    }

    return MassMails.findOne({ _id: entryId });
  },
};

requireBuyer(mutations, 'massMailsSend');

export default mutations;
