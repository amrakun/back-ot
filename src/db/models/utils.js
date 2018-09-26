import moment from 'moment';
import crypto from 'crypto';
import { encryptAes256Ctr } from 'mongoose-field-encryption';

/*
 * A base class for models with status, publishDate, closeDate fields
 */
export class StatusPublishClose {
  /*
   * Open drafts
   * @return - Published item ids
   */
  static async publishDrafts() {
    const drafts = await this.find({ status: 'draft' });
    const results = [];

    for (let draft of drafts) {
      // publish date is reached
      if (isReached(draft.publishDate)) {
        // change status to open
        await this.update({ _id: draft._id }, { $set: { status: 'open' } });

        results.push(draft._id);
      }
    }

    return results;
  }

  /*
   * Close opens if closeDate is here
   * @return - Closed item ids
   */
  static async closeOpens() {
    const opens = await this.find({ status: 'open' });
    const results = [];

    for (let open of opens) {
      // close date is reached
      if (isReached(open.closeDate)) {
        // change status to closed
        await this.update({ _id: open._id }, { $set: { status: 'closed' } });

        results.push(open._id);
      }
    }

    return results;
  }
}

/*
 * Mongoose field options wrapper
 */
export const field = options => {
  const { optional } = options;

  if (!optional) {
    options.required = true;
    options.validate = /\S+/;
  }

  return options;
};

const getNow = () => {
  return new Date();
};

/*
 * Doing this to mock date time now in test
 */
const utils = {
  getNow,
};

/*
 * Checks that given date is reached
 */
export const isReached = date => moment(date) <= utils.getNow();

export const encrypt = text => {
  const { ENCRYPTION_SECRET } = process.env;
  return encryptAes256Ctr(text, ENCRYPTION_SECRET);
};

export const decrypt = encryptedHex => {
  const { ENCRYPTION_SECRET } = process.env;
  const decipher = crypto.createDecipher('aes-256-ctr', ENCRYPTION_SECRET);

  return decipher.update(encryptedHex, 'hex', 'utf8');
};

export const encryptArray = textArray => {
  return (textArray || []).map(text => encrypt(text));
};

export const decryptArray = hexArray => {
  return (hexArray || []).map(hex => decrypt(hex));
};

export default utils;
