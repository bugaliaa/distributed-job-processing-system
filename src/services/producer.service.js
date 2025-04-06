const { default: mongoose } = require('mongoose');
const { producer } = require('../config/kafka');
const Jobs = require('../models/job.model');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ProducerService {
    constructor() {
        this.connect();
    }

    async connect() {
        try {
            await producer.connect();
            logger.info('Kafka producer connected');
        } catch (err) {
            logger.error('Failed to connect to Kafka Producer:', err);
            throw err;
        }
    }

    async createJob(type, payload) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const jobId = uuidv4();
            const job = new Jobs({
                jobId,
                type,
                payload,
                status: 'queued',
                metadata: {
                    createdAt: new Date()
                }
            });

            await job.save( {session} );

            await producer.send({
                topic: process.env.KAFKA_JOBS_TOPIC,
                messages: [{
                    key: type,
                    value: JSON.stringify({
                        jobId,
                        type,
                        payload
                    })
                }]
            });

            await session.commitTransaction();

            return job;
        } catch (err) {
            await session.abortTransaction();
            logger.error('Failed to create job:', err);
            throw err;
        } finally {
            session.endSession();
        }
    }
}

module.exports = new ProducerService();
