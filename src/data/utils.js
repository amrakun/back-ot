import xlsxPopulate from 'xlsx-populate';
import AWS from 'aws-sdk';
import fs from 'fs';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';

/*
 * Save binary data to amazon s3
 * @param {String} name - File name
 * @param {Object} data - File binary data
 * @return {String} - Uploaded file url
 */
export const uploadFile = async file => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET, AWS_PREFIX = '' } = process.env;

  // check credentials
  if (!(AWS_ACCESS_KEY_ID || AWS_SECRET_ACCESS_KEY || AWS_BUCKET)) {
    throw new Error('Security credentials are not configured');
  }

  // initialize s3
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

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
        ACL: 'public-read',
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      },
    );
  });

  return `https://s3.amazonaws.com/${AWS_BUCKET}/${fileName}`;
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
  const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS } = process.env;

  return nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE || false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
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
export const sendEmail = async ({ toEmails, fromEmail, title, template }) => {
  const { COMPANY_EMAIL_FROM, NODE_ENV } = process.env;

  // do not send email it is running in test mode
  if (NODE_ENV == 'test') {
    return;
  }

  const transporter = await createTransporter();

  const { isCustom, data, name } = template;

  // generate email content by given template
  let html = await applyTemplate(data, name);

  if (!isCustom) {
    html = await applyTemplate({ content: html }, 'base');
  }

  return toEmails.map(toEmail => {
    const mailOptions = {
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};

/*
 * Read xlsx template
 */
export const readTemplate = async name => {
  const workbook = await xlsxPopulate.fromFileAsync(
    `${__dirname}/../private/templates/${name}.xlsx`,
  );

  return { workbook, firstSheet: workbook.sheet(0) };
};

/*
 * Generate xlsx
 */
export const generateXlsx = async (workbook, name) => {
  const url = `templateOutputs/${name}.xlsx`;

  await workbook.toFileAsync(`${__dirname}/../private/${url}`);

  return `static/${url}`;
};

export default {
  sendEmail,
  readFile,
  createTransporter,
};
