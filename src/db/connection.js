/* eslint-disable no-console */

import { graphql } from 'graphql';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import schema from '../data/';
import { userFactory } from './factories';
import { debugDb } from '../debuggers';

dotenv.config();

const { NODE_ENV, TEST_MONGO_URL, MONGO_URL } = process.env;
const isTest = NODE_ENV == 'test';
const DB_URI = isTest ? TEST_MONGO_URL : MONGO_URL;

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

if (!isTest) {
  mongoose.connection
    .on('connected', () => {
      debugDb(`Connected to the database: ${DB_URI}`);
    })
    .on('disconnected', () => {
      debugDb(`Disconnected from the database: ${DB_URI}`);
    })
    .on('error', error => {
      debugDb(`Database connection error: ${DB_URI}`, error);
    });
}

export function connect() {
  return mongoose.connect(DB_URI).then(() => {
    // empty (drop) database before running tests
    if (isTest) {
      return mongoose.connection.db.dropDatabase();
    }
  });
}

export function disconnect() {
  return mongoose.connection.disconnect();
}

export const graphqlRequest = async (mutation, name, args, context) => {
  const user = await userFactory({});

  const rootValue = {};

  const res = {
    cookie: () => {},
  };

  const response = await graphql(schema, mutation, rootValue, context || { res, user }, args);

  if (response.errors) {
    throw response.errors;
  }

  return response.data[name];
};
