const WorkerPool = require('./worker.pool');
const path = require('path');
const logger = require('../../utils/logger');

const workerPool = new WorkerPool(path.join(__dirname, 'blockchain.worker.js'));

async function processBlockchainVerification(payload) {
    const { transactionHashes, network } = payload;

    try {
        const results = await Promise.all(
        transactionHashes.map(hash =>
            workerPool.enqueueTask({
            type: 'verify-tx',
            transactionHash: hash,
            network
            }))
        );

        return {
            network,
            timestamp: new Date().toISOString(),
            verifiedTransactions: results.filter(r => r.verified),
            failedTransactions: results.filter(r => !r.verified)
        };
    } catch (err) {
        logger.error('Distributed blockchain verification failed:', err);
        throw err;
    }
}

module.exports = processBlockchainVerification;
