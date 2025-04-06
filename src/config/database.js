const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
            socketTimeoutMS: 45000
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection failed', error);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

module.exports = connectDB;
