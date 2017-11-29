/* eslint-disable no-console */

import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { connect } from './db/connection';
import schema from './data';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use(
  '/graphql',
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
