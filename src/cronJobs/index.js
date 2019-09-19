import bodyParser from 'body-parser';

import dotenv from 'dotenv';

// load environment variables
dotenv.config();

import express from 'express';
import { connect } from '../db/connection';

import './companies';
import './audits';
import './tenders';
import './feedbacks';
import './blockedCompanies';

// connect to mongo database
connect();

const app = express();

// for health check
app.get('/status', async (req, res) => {
  res.end('ok');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((error, req, res) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT_CRONS } = process.env;

app.listen(PORT_CRONS, () => {
  console.log(`Cron Server is now running on ${PORT_CRONS}`);
});
