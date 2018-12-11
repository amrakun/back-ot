import * as AWS from 'aws-sdk';
import { MailDeliveries } from '../db/models';

export const getApi = type => {
  const { AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

  AWS.config.update({
    accessKeyId: AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });

  if (type === 'ses') {
    return new AWS.SES();
  }

  return new AWS.SNS();
};

/*
 * Receives notification from amazon simple notification service
 * And updates message status and stats
 */
const handleMessage = async message => {
  const obj = JSON.parse(message);

  const { eventType, mail } = obj;
  const { headers } = mail;

  const mailId = headers.find(header => header.name === 'Mailid');

  await MailDeliveries.updateStatus({
    status: eventType,
    mailId: mailId.value,
  });
};

export const trackSes = app => {
  app.post(`/service/ses/tracker`, (req, res) => {
    const chunks = [];

    req.setEncoding('utf8');

    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const message = JSON.parse(chunks.join(''));

      const { Type = '', Message = {}, Token = '', TopicArn = '' } = message;

      if (Type === 'SubscriptionConfirmation') {
        await getApi('sns')
          .confirmSubscription({ Token, TopicArn })
          .promise();

        return res.end('success');
      }

      handleMessage(Message);
    });

    return res.end('success');
  });
};

export const awsRequests = {
  getVerifiedEmails() {
    return getApi('ses')
      .listVerifiedEmailAddresses()
      .promise();
  },
};
