import xlsxPopulate from 'xlsx-populate';
import strip from 'strip';
import AWS from 'aws-sdk';
import fs from 'fs';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import clamav from 'clamav.js';
import {
  Companies,
  Tenders,
  TenderResponses,
  Configs,
  MailDeliveries,
  AuditResponses,
  PhysicalAudits,
  TenderMessages,
} from '../db/models';

export const createAWS = () => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET } = process.env;

  // check credentials
  if (!(AWS_ACCESS_KEY_ID || AWS_SECRET_ACCESS_KEY || AWS_BUCKET)) {
    throw new Error('Security credentials are not configured');
  }

  // initialize s3
  return new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });
};

/*
 * Read file from amazon s3
 * @param {String} key - File name
 * @return {String} - file
 */
export const readS3File = async (key, user) => {
  const { NODE_ENV } = process.env;

  // do not read file in test mode
  if (NODE_ENV == 'test') {
    return { Body: '' };
  }

  if (!user) {
    throw new Error('Forbidden');
  }

  if (
    user !== 'system' &&
    !(
      (await Companies.isAuthorizedToDownload(key, user)) ||
      (await Tenders.isAuthorizedToDownload(key, user)) ||
      (await TenderResponses.isAuthorizedToDownload(key, user)) ||
      (await AuditResponses.isAuthorizedToDownload(key, user)) ||
      (await PhysicalAudits.isAuthorizedToDownload(key, user)) ||
      (await TenderMessages.isAuthorizedToDownload(key, user))
    )
  ) {
    throw new Error('Forbidden');
  }

  const { AWS_BUCKET } = process.env;

  const s3 = createAWS();

  // upload to s3
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: AWS_BUCKET,
        Key: key,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      },
    );
  });
};

/*
 * Save binary data to amazon s3
 * @param {String} name - File name
 * @param {Object} data - File binary data
 * @return {String} - Uploaded file url
 */
export const uploadFile = async file => {
  const { AWS_BUCKET, AWS_PREFIX = '' } = process.env;

  const s3 = createAWS();

  // generate unique name
  const fileName = `${AWS_PREFIX}${Math.random()}${file.name}`;

  // read file
  const buffer = await fs.readFileSync(file.path);

  // upload to s3
  await new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: buffer,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      },
    );
  });

  return fileName;
};

/**
 * Read contents of a file
 * @param {string} filename - relative file path
 * @return {Promise} returns promise resolving file contents
 */
export const readFile = filename => {
  const filePath = `${__dirname}/../private/emailTemplates/${filename}.html`;

  return fs.readFileSync(filePath, 'utf8');
};

/**
 * SendEmail template helper
 * @param {Object} data data
 * @param {String} templateName
 * @return email with template as text
 */
const applyTemplate = async (data, templateName) => {
  let template = await readFile(templateName);

  template = Handlebars.compile(template.toString());

  return template(data);
};

/**
 * Create transporter
 * @return nodemailer transporter
 */
export const createTransporter = async () => {
  const { AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

  AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
  });

  return nodemailer.createTransport({
    SES: new AWS.SES({ apiVersion: '2010-12-01' }),
  });
};

/**
 * Send email
 * @param {Array} args.toEmails
 * @param {String} args.fromEmail
 * @param {String} args.title
 * @param {String} args.templateArgs.name
 * @param {Object} args.templateArgs.data
 * @param {Boolean} args.templateArgs.isCustom
 * @return {Promise}
 */
export const sendEmail = async args => {
  const { toEmails, fromEmail, title, content = '', template, attachments = [] } = args;
  const { COMPANY_EMAIL_FROM, NODE_ENV, AWS_SES_CONFIG_SET } = process.env;

  // do not send email it is running in test mode
  if (NODE_ENV == 'test') {
    return;
  }

  if (!strip(title) || !strip(content)) {
    return console.log('Empty subject or content');
  }

  const transporter = await createTransporter();

  let html = await applyTemplate({ content }, 'base');

  if (template) {
    const { isCustom, data, name } = template;

    // generate email content by given template
    html = await applyTemplate(data, name);

    if (!isCustom) {
      html = await applyTemplate({ content: html }, 'base');
    }
  }

  const mailId = Math.random();

  return toEmails.map(toEmail => {
    const options = {
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html,
    };

    const mailOptions = {
      ...options,
      attachments,
      headers: {
        'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET,
        Mailid: mailId,
      },
    };

    // create mail delivery entry
    MailDeliveries.createStatus({
      ...options,
      mailId,
      status: 'pending',
    });

    return transporter.sendMail(mailOptions, (error, info) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};

/*
 * Send email using config
 */
export const sendConfigEmail = async ({
  templateObject,
  name,
  kind,
  toEmails,
  attachments,
  replacer,
}) => {
  const config = await Configs.getConfig();
  const templates = config[name] || {};
  const template = templateObject || templates[kind];

  if (!template) {
    throw new Error(`${name} ${kind} template not found`);
  }

  const { from, subject, content } = template;

  let subjectEn = subject.en;
  let subjectMn = subject.mn;
  let contentEn = content.en;
  let contentMn = content.mn;

  if (replacer) {
    subjectEn = replacer(subjectEn);
    subjectMn = replacer(subjectMn);
    contentEn = replacer(contentEn);
    contentMn = replacer(contentMn);
  }

  return sendEmail({
    fromEmail: from,
    toEmails,
    title: `${subjectEn} ${subjectMn}`,
    content: `${contentEn} ${contentMn}`,
    attachments,
  });
};

/*
 * Read xlsx template
 */
export const readTemplate = async name => {
  const workbook = await xlsxPopulate.fromFileAsync(
    `${__dirname}/../private/templates/${name}.xlsx`,
  );

  return { workbook, sheet: workbook.sheet(0) };
};

export const tokenize = str => {
  let result = '';

  for (let i = 0, length = str.length; i < length; i++) {
    const code = str.charCodeAt(i);

    result = `${result}${code + 2}`;
  }

  return result;
};

/*
 * Generate xlsx
 */
export const generateXlsx = async (user, workbook, _name) => {
  const name = _name.replace(/\//g, '-');

  if (!user) {
    return '';
  }

  const id = tokenize(user.username);
  const dir = `${__dirname}/../private/templateOutputs/${id}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const { DOMAIN } = process.env;

  await workbook.toFileAsync(`${dir}/${name}.xlsx`);

  return `${DOMAIN}/static/templateOutputs/${id}/${name}.xlsx`;
};

/*
 * First install clamav service https://www.clamav.net/documents/installation-on-macos-mac-os-x
 * And using clamav.js connector for clamav service
 * For mac install clamav from source and use call clamd command from this folder
 */
export const virusDetector = stream => {
  const { NODE_ENV } = process.env;

  return new Promise((resolve, reject) => {
    if (NODE_ENV === 'development') {
      return resolve('ok');
    }

    const { CLAMAV_PORT = 3310, CLAMAV_HOST = '127.0.0.1' } = process.env;

    clamav.createScanner(CLAMAV_PORT, CLAMAV_HOST).scan(stream, (err, object, malicious) => {
      if (err) {
        reject(err);
      } else if (malicious) {
        reject(malicious);
      } else {
        resolve('ok');
      }
    });
  });
};

export default {
  sendEmail,
  sendConfigEmail,
  readFile,
  readS3File,
  createTransporter,
};
