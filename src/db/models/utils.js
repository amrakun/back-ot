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

  const fixedString = text && text.toString ? text.toString() : text;

  return encryptAes256Ctr(fixedString, ENCRYPTION_SECRET);
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

/*
 * Get all possible fields for given schema
 */
export const getFieldsBySchema = schema => {
  const filterdNames = [];
  const names = Object.keys(schema.paths);

  for (let name of names) {
    const options = schema.paths[name].options;

    if (options.qualifiable !== false) {
      filterdNames.push(name);
    }
  }

  return filterdNames;
};

export const isEmpty = (input, isParent = false) => {
  const checkObject = obj => {
    if (Array.isArray(obj)) {
      return obj.length === 0;
    }

    for (let key in obj) {
      if (obj[key]) return false;
    }

    return true;
  };

  if (isParent) {
    for (let key in input) {
      return checkObject(input[key]);
    }
  }

  return checkObject(input);
};

export const generateSearchText = (data = {}) => {
  const { basicInfo = {}, shareholderInfo = {}, contactInfo = {}, managementTeamInfo = {} } = data;

  const { enName, mnName, email, registrationNumber } = basicInfo || {};
  const { phone, phone2, address, address2, address3 } = contactInfo || {};
  const { shareholders = [] } = shareholderInfo || {};
  const { managingDirector = {}, executiveOfficer = {} } = managementTeamInfo || {};

  const teamMembers = [managingDirector, executiveOfficer];
  const companies = shareholders.filter(obj => obj.companyName);

  const check = str => (str ? `${str},` : '');
  const generateText = (array, key) => {
    let str = '';

    if (!array || !key) return str;

    array.map(obj => (str = `${str}${check(obj[key])} `));

    return str;
  };

  const companyName = `${check(enName)} ${check(mnName)} ${generateText(companies, 'companyName')}`;
  const basicAddress = `${check(basicInfo.address)} ${check(basicInfo.address2)} ${check(
    basicInfo.address3,
  )}`;
  const contactAddress = `${check(address)} ${check(address2)} ${check(address3)}`;

  return {
    companyName,
    phone: `${check(phone)} ${check(phone2)} ${generateText(teamMembers, 'phone')}`,
    email: `${check(email)} ${check(contactInfo.email)} ${generateText(teamMembers, 'email')}`,
    registrationNumber,
    address: `${basicAddress} ${contactAddress}`,
    fullName: generateText(teamMembers, 'name'),
    firstName: generateText(shareholders, 'firstName'),
    lastName: generateText(shareholders, 'lastName'),
  };
};

export default utils;
