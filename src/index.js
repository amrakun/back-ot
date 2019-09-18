/* eslint-disable no-console */

import apm from 'elastic-apm-node/start';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { debugInit } from './debuggers';

// load environment variables
dotenv.config();

const { MAIN_APP_DOMAIN } = process.env;

import express from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import formidable from 'formidable';
import fileType from 'file-type';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { connect } from './db/connection';
import { userMiddleware } from './auth';
import { uploadFile, readS3File, tokenize, virusDetector } from './data/utils';
import { downloadFiles, downloadTenderMessageFiles } from './data/tenderUtils';
import schema from './data';
import './messageBroker';

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(userMiddleware);

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

app.use(
  '/static',
  (req, res, next) => {
    if (!req.user) {
      return res.end('foribidden');
    }

    if (
      req.path.includes('templateOutputs') &&
      !req.path.includes(`templateOutputs/${tokenize(req.user.username)}`)
    ) {
      return res.end('foribidden');
    }

    return next();
  },

  express.static(path.join(__dirname, 'private')),
);

app.use(
  cors({
    credentials: true,
    origin: MAIN_APP_DOMAIN,
  }),
);

// read file from amazon s3
app.get('/read-file', async (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.end('invalid key');
  }

  if (!req.user) {
    return res.end('foribidden');
  }

  try {
    const response = await readS3File(key, req.user);

    res.attachment(key);

    return res.send(response.Body);
  } catch (e) {
    return res.end(e.message);
  }
});

// download tender files
app.get('/download-tender-files', async (req, res) => {
  const tenderId = req.query.tenderId;

  try {
    const response = await downloadFiles(tenderId, req.user);

    res.attachment('files.zip');

    return res.send(response);
  } catch (e) {
    return res.end(e.message);
  }
});

// download tender message files
app.get('/download-tender-message-files', async (req, res) => {
  const tenderId = req.query.tenderId;

  try {
    const response = await downloadTenderMessageFiles(tenderId, req.user);

    res.attachment('files.zip');

    return res.send(response);
  } catch (e) {
    return res.end(e.message);
  }
});

// file upload
app.post('/upload-file', async (req, res) => {
  if (!req.user) {
    return res.status(500).send('Forbidden');
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, response) => {
    const file = response.file || response.upload;
    const { size } = file;

    // 20mb
    if (size > 20000000) {
      return res.status(500).send('Too large file');
    }

    // read file
    const buffer = await fs.readFileSync(file.path);

    // determine file type using magic numbers
    const { mime } = fileType(buffer);

    if (
      [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-msi',
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
      ].includes(mime)
    ) {
      // check for virus
      try {
        const stream = await fs.createReadStream(file.path);
        await virusDetector(stream);
      } catch (e) {
        return res.status(500).send('Infected file');
      }

      const result = await uploadFile(file, response.upload ? true : false);

      return res.send(result);
    }

    return res.status(500).send('Invalid file');
  });
});

app.use('/graphql', graphqlExpress((req, res) => ({ schema, context: { res, user: req.user } })));

// Wrap the Express server
const server = createServer(app);

// subscriptions server
const { PORT } = process.env;

server.listen(PORT, () => {
  debugInit(`GraphQL Server is now running on ${PORT}`);
});

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
    }),
  );
}
