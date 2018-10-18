/* eslint-disable no-console */

import path from 'path';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import formidable from 'formidable';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { connect } from './db/connection';
import { userMiddleware } from './auth';
import { uploadFile } from './data/utils';
import schema from './data';
import './startup';

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, 'private')));

app.use(cors());

// file upload
app.post('/upload-file', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, response) => {
    const { type, size } = response.file;

    // 20mb
    if (size > 20000000) {
      return res.status(500).send('Too large file');
    }

    if (
      [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
      ].includes(type)
    ) {
      const url = await uploadFile(response.file);
      return res.end(url);
    }

    return res.status(500).send('Invalid file');
  });
});

app.use(
  '/graphql',
  userMiddleware,
  graphqlExpress(req => ({ schema, context: { user: req.user } })),
);

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
