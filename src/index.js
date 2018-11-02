/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
import { uploadFile, readS3File } from './data/utils';
import schema from './data';
import './startup';

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(userMiddleware);

app.use(
  '/static',
  (req, res, next) => {
    if (!req.user) {
      return res.end('foribidden');
    }

    if (
      req.path.includes('templateOutputs') &&
      !req.path.includes(`templateOutputs/${req.user.username}`)
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
  if (!req.user) {
    return res.end('foribidden');
  }

  const key = req.query.key;

  const response = await readS3File(key);

  res.attachment(key);

  return res.send(response.Body);
});

// file upload
app.post('/upload-file', async (req, res) => {
  if (!req.user) {
    return res.status(500).send('Forbidden');
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, response) => {
    const { size } = response.file;

    // 20mb
    if (size > 20000000) {
      return res.status(500).send('Too large file');
    }

    // read file
    const buffer = await fs.readFileSync(response.file.path);

    // determine file type using magic numbers
    const { mime } = fileType(buffer);

    if (
      [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
      ].includes(mime)
    ) {
      const url = await uploadFile(response.file);
      return res.end(url);
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
  console.log(`GraphQL Server is now running on ${PORT}`);
});

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
    }),
  );
}
