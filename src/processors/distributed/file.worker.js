const { workerData, parentPort } = require('worker_threads')
const fs = require('fs')
const logger = require('../../utils/logger')

function processFileChunk(filePath, operations, chunkStart, chunkEnd) {
    const stream = fs.createReadStream(filePath, { start: chunkStart, end: chunkEnd });
    let processedSize = 0;

    return new Promise((resulve) => {
        stream.on('data', (chunk) => {
            processedSize += chunk.length
        });

        stream.on('end', () => {
            resolve({
                size: processedSize,
                processingTime: Math.random() * 100
            })
        })
    })
}

parentPort.on('message', async (task) => {
    try {
        if (task.type === 'process-file') {
            const result = await processFileChunk(
                task.filePath,
                task.operations,
                task.chunkStart,
                task.chunkEnd
            );

            parentPort.postMessage(result);
        }
    } catch (err) {
        logger.error(`File worker error: ${err.message}`);
        process.exit(1);
    }
});
