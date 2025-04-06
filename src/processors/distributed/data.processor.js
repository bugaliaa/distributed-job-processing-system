const WorkerPool = require('./worker.pool');
const path = require('path');
const logger = require('../../utils/logger');

const workerPool = new WorkerPool(path.join(__dirname, 'data.worker.js'));

async function processDataEnrichment(payload) {
    const { data, enrichmentServices, batchSize = 100 } = payload;

    try {
        const batches = [];
        const keys = Object.keys(data);

        for (let i = 0; i < keys.length; i += batchSize) {
            batches.push(keys.slice(i, i + batchSize));
        }

        const results = await Promise.all(
            batches.map(batchKeys =>
                workerPool.enqueueTask({
                    type: 'enrich-data',
                    data: batchKeys.reduce((acc, key) => {
                        acc[key] = data[key];
                        return acc;
                    }, {}),
                    enrichmentServices
                })
            )
        );

        return results.reduce((acc, batch) => ({ ...acc, ...batch }), {});
    } catch (err) {
        logger.error('Distributed data enrichment failed:', err);
        throw err;
    }
}

module.exports = processDataEnrichment;
