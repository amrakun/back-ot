import xlsxPopulate from 'xlsx-populate';
import AWS from 'aws-sdk';
import fs from 'fs';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { Configs } from '../db/models';

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
export const readS3File = key => {
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
  const { COMPANY_EMAIL_FROM, NODE_ENV } = process.env;

  // do not send email it is running in test mode
  if (NODE_ENV == 'test') {
    return;
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

  return toEmails.map(toEmail => {
    const mailOptions = {
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html,
      attachments,
    };

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

/*
 * Generate xlsx
 */
export const generateXlsx = async (user, workbook, name) => {
  const { DOMAIN } = process.env;
  const url = `templateOutputs/${name}.xlsx`;

  await workbook.toFileAsync(`${__dirname}/../private/${url}`);

  return `${DOMAIN}/static/${url}`;
};

export default {
  sendEmail,
  sendConfigEmail,
  readFile,
  createTransporter,
};
