/* eslint-disable no-console */

import { graphql } from 'graphql';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import schema from '../data/';

dotenv.config();

const { NODE_ENV, TEST_MONGO_URL, MONGO_URL } = process.env;
const isTest = NODE_ENV == 'test';
const DB_URI = isTest ? TEST_MONGO_URL : MONGO_URL;

mongoose.Promise = global.Promise;

if (!isTest) {
  mongoose.connection
    .on('connected', () => {
      console.log(`Connected to the database: ${DB_URI}`);
    })
    .on('disconnected', () => {
      console.log(`Disconnected from the database: ${DB_URI}`);
    })
    .on('error', error => {
      console.log(`Database connection error: ${DB_URI}`, error);
    });
}

export function connect() {
  return mongoose
    .connect(DB_URI, {
      useMongoClient: true,
    })
    .then(() => {
      // empty (drop) database before running tests
      if (isTest) {
        return mongoose.connection.db.dropDatabase();
      }
    });
}

export function disconnect() {
  return mongoose.connection.close();
}

export const graphqlRequest = async (mutation, name, args) => {
  const rootValue = {};
  const context = { user: { _id: '_id' } };

  const response = await graphql(schema, mutation, rootValue, context, args);

  if (response.errors) {
    throw response.errors;
  }

  return response.data[name];
};
