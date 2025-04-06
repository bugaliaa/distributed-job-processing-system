import { createLogger, format, transports } from 'winston';
import { combine, timestamp, printf, colorize, errors, json } from 'winston.format';
import path from 'path';

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
});

const fileFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = {
        timestamp,
        level,
        message,
        ...metadata
    };

    if (stack) {
        log.stack = stack;
    }

    return JSON.stringify(log);
});

export const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'job-processor' },
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                consoleFormat
            ),
            handleExceptions: true
        }),
        new transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: fileFormat,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
    exitOnError: false
});

logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
});
