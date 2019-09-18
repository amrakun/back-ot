import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';

dotenv.config();

const { RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let connection;
let channel;

export const sendMessage = async (queueName, data) => {
  if (channel) {
    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
  }
};

const init = async () => {
  try {
    connection = await amqplib.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();
  } catch (e) {
    console.log(e.message);
  }
};

init();
