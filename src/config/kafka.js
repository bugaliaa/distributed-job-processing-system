import Kafka from 'kafkajs';

export const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    retry: {
        initialRetryTime: 100,
        retries: 10,
    }
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: `${process.env.KAFKA_CLIENT_ID}-group` });
