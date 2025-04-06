const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    retry: {
        initialRetryTime: 100,
        retries: 10,
    }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: `${process.env.KAFKA_CLIENT_ID}-group` });

module.exports = {
    kafka,
    producer,
    consumer,
};
