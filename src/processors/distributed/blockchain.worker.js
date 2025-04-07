const { parentPort } = require('worker_threads');
const crypto = require('crypto');
const logger = require('../../utils/logger');

const simulatedChain = Array(10).fill(0).map((_, i) => ({
    blockNumber: i,
    transactions: Array(5).fill(0).map(() => ({
        hash: crypto.randomBytes(32).toString('hex'),
        status: Math.random() > 0.2 ? 'mined' : 'failed'
    }))
}));

function verifyTransaction(hash) {
    const delay = 100 + Math.random() * 400;

    return new Promise(resolve => {
        setTimeout(() => {
            for (const block of simulatedChain) {
                const tx = block.transactions.find(t => t.hash === hash);
                if (tx) {
                    resolve({
                        verified: tx.status === 'mined',
                        blockNumber: block.blockNumber,
                        confirmations: simulatedChain.length - block.blockNumber
                    });
                    return;
                }
            }
            resolve({ verified: false, error: 'Transaction not found' });
        }, delay);
    });
}

parentPort.on('message', async (task) => {
    try {
        if (task.type === 'verify-tx') {
            const result = await verifyTransaction(task.transactionHash);
            parentPort.postMessage({
                transactionHash: task.transactionHash,
                network: task.network,
                ...result
            });
        }
    } catch (err) {
        logger.error(`Blockchain worker error: ${err.message}`);
        process.exit(1);
    }
});
