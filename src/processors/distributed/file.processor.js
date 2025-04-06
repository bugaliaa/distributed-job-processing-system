const WorkerPool = require('./worker.pool');
const path = require('path');
const logger = require('../utils/logger');

const workerPool = new WorkerPool(path.join(__dirname, 'file.worker.js'));

async function processFileJob(payload) {
    const { filePath, operations, chunkSize = 1024 * 1024 } = payload;

    try {
        const results = await workerPool.enqueueTask({
            type: 'process-file',
            filePath,
            operations,
            chunkSize
        });

        return {
            success: true,
            processedChunks: results.length,
            stats: results.reduce((acc, curr) => ({
                totalSize: acc.totalSize + curr.size,
                processingTime: acc.processingTime + curr.processingTime
            }), {totalSize: 0, processingTime: 0})
        };
    } catch (err) {
        logger.error('Distributed file processing failed: ', err);
        throw err;
    }
}

module.exports = processFileJob;
