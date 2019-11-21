import xlsxPopulate from 'xlsx-populate';
import AWS from 'aws-sdk';
import fs from 'fs';
import clamav from 'clamav.js';
import requestify from 'requestify';
import {
  Companies,
  Tenders,
  TenderResponses,
  Configs,
  AuditResponses,
  PhysicalAudits,
  TenderMessages,
} from '../db/models';
import { debugExternalApi, debugBase } from '../debuggers';
import { sendMessage } from '../messageBroker';

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
export const readS3File = async (key, user, encoder = '') => {
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

  let parsedKey = key;

  if (encoder === 'encodeURI') {
    parsedKey = encodeURI(key);
  }

  if (encoder === 'decodeURIComponent') {
    parsedKey = decodeURIComponent(key);
  }

  // upload to s3
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: AWS_BUCKET,
        Key: parsedKey,
      },
      (error, response) => {
        if (error) {
          if (encoder === '') {
            return readS3File(key, user, 'decodeURIComponent')
              .then(res => resolve(res))
              .catch(error => reject(error));
          }

          if (encoder === 'decodeURIComponent') {
            return readS3File(key, user, 'encodeURI')
              .then(res => resolve(res))
              .catch(error => reject(error));
          } else {
            return reject(error);
          }
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
export const uploadFile = async (file, fromEditor = false) => {
  const { DOMAIN, AWS_BUCKET, AWS_PREFIX = '' } = process.env;

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

  if (fromEditor) {
    return {
      fileName: file.name,
      uploaded: 1,
      url: `${DOMAIN}/read-file?key=${fileName}`,
    };
  }

  return fileName;
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
  const { toEmails, fromEmail, subject, content = '', template, attachments = [] } = args;

  sendMessage('sendEmail', {
    template,
    from: fromEmail,
    toEmails,
    subject,
    content,
    attachments,
  });
};

let configCache;

export const getConfig = async () => {
  if (configCache) {
    return configCache;
  }

  const config = await Configs.getConfig();

  configCache = config;

  return config;
};

export const resetConfigCache = () => {
  configCache = null;
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
  const config = await getConfig();
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
    subject: `${subjectEn} ${subjectMn}`,
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

/**
 * Sends post request to specific url
 * @param {Object} param1
 * @param {string} errorMessage
 */
export const sendRequest = async (param1, errorMessage) => {
  const { url, method, headers, form, body, params } = param1;
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (NODE_ENV === 'test') {
    return;
  }

  debugExternalApi(`
    Sending request to
    url: ${url}
    method: ${method}
    body: ${JSON.stringify(body)}
    params: ${JSON.stringify(params)}
  `);

  try {
    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', origin: DOMAIN, ...(headers || {}) },
      form,
      body,
      params,
    });

    const responseBody = response.getBody();

    debugExternalApi(`
      Success from : ${url}
      responseBody: ${JSON.stringify(responseBody)}
    `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED') {
      debugExternalApi(errorMessage);
      throw new Error(errorMessage);
    } else {
      debugExternalApi(`Error occurred : ${e.body || e.message || e}`);
      throw new Error(e.body || e.message || e);
    }
  }
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putCreateLog = (params, user) => {
  const doc = { ...params, action: 'create', object: JSON.stringify(params.object) };

  return putLog(doc, user);
};

/**
 * Prepares a create log request to log server
 * @param {Object} params Log document params
 * @param {string} params.type Module name
 * @param {Object} params.object Previous data as object
 * @param {string} params.newData Data to be changed
 * @param {string} params.description Description text
 * @param user User information from mutation context
 */
export const putUpdateLog = (params, user) => {
  const doc = { ...params, action: 'update', object: JSON.stringify(params.object) };

  return putLog(doc, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = (params, user) => {
  const doc = { ...params, action: 'delete', object: JSON.stringify(params.object) };

  return putLog(doc, user);
};

/**
 * Sends a request to logs api
 * @param {Object} body Request
 * @param {Object} user User information from mutation context
 */
const putLog = async (body, user) => {
  const LOGS_DOMAIN = getEnv({ name: 'LOGS_API_DOMAIN' });

  if (!LOGS_DOMAIN) {
    return;
  }

  const doc = {
    ...body,
    createdBy: user._id,
    unicode: user.username || user.email || user._id,
  };
  const msg = `
    Failed to connect to logs api.
    Check whether LOGS_API_DOMAIN env is missing or logs api is not running
  `;

  try {
    await sendRequest(
      { url: `${LOGS_DOMAIN}/logs/create`, method: 'post', body: { params: JSON.stringify(doc) } },
      msg,
    );
  } catch (e) {
    console.log(e);
  }
};

/**
 * Sends a request to mailer api
 * @param {Object} param0 Request
 */
export const fetchMailer = (path, params) => {
  const MAILER_API_DOMAIN = getEnv({ name: 'MAILER_API_DOMAIN' });

  const msg = `
    Failed to connect to mailer api.
    Check whether MAILER_API_DOMAIN env is missing or mailer api is not running
  `;

  return sendRequest(
    {
      url: `${MAILER_API_DOMAIN}/${path}`,
      method: 'get',
      body: { params: JSON.stringify(params) },
    },
    msg,
  );
};

/**
 * Sends a request to logs api
 * @param {Object} param0 Request
 */
export const fetchLogs = params => {
  const LOGS_DOMAIN = getEnv({ name: 'LOGS_API_DOMAIN' });

  if (!LOGS_DOMAIN) {
    return {
      logs: [],
      totalCount: 0,
    };
  }
  const msg = `
    Failed to connect to logs api.
    Check whether LOGS_API_DOMAIN env is missing or logs api is not running
  `;

  return sendRequest(
    { url: `${LOGS_DOMAIN}/logs`, method: 'get', body: { params: JSON.stringify(params) } },
    msg,
  );
};

export const getEnv = ({ name, defaultValue }) => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

const quickSortSwap = (array, i, j) => {
  const temp = array[i];

  array[i] = array[j];

  array[j] = temp;
};

const quickSortPartition = (array, checker, start, end) => {
  let pivotIndex = start;

  for (let i = start; i <= end - 1; i++) {
    if (checker(array[i], array[end])) {
      quickSortSwap(array, i, pivotIndex);

      pivotIndex += 1;
    }
  }

  quickSortSwap(array, pivotIndex, end);

  return pivotIndex;
};

/*
input = [7,2,1,6,8,5,3,4]

pivot=4

pIndex=0; i=0; 7^',2,1,6,8,5,3,4
pIndex=0; i=1; 2,7^',1,6,8,5,3,4 pIndex=1
pIndex=1; i=2; 2,1,7^',6,8,5,3,4 pIndex=2
pIndex=2; i=3; 2,1,7^,6',8,5,3,4
pIndex=2; i=4; 2,1,7^,6,8',5,3,4
pIndex=2; i=5; 2,1,7^,6,8,5',3,4
pIndex=2; i=6; 2,1,3,6^,8,5,7',4 pIndex=3

2,1,3, 4^ ,8,5,7', 6
return pIndex(3)
=========================================

input=2,1,3
pivot=3

pIndex=0; i=0; 2^',1,3 => 2',1^,3 pIndex=1
pIndex=1; i=1; 2,1^',3 => 2,1',3^ pIndex=2

2,1,3
return pIndex(2)
=========================================

input=2,1
pivot=1

pIndex=0; i=0; 2^',1 => no need

1,2
return pIndex(0)
=========================================

input=1,2
pivot=2

pIndex=0; i=0; 1^',2 => 1'2^ pIndex=1

1,2
return pIndex(1)
=========================================


input=8,5,7,6
pivot=6

pIndex=0; i=0; 8^',5,7,6 => no need
pIndex=0; i=1; 8^,5',7,6 => 5,8^',7,6 pIndex=1
pIndex=1; i=2; 5,8^,7',6 => no need

5,6,7,8
return pIndex(1)
=========================================
*/
export const quickSort = (array, checker, start, end) => {
  if (end > start) {
    const pIndex = quickSortPartition(array, checker, start, end);

    quickSort(array, checker, start, pIndex - 1);
    quickSort(array, checker, pIndex + 1, end);
  }

  return array;
};

export default {
  sendEmail,
  sendConfigEmail,
  readS3File,
};
