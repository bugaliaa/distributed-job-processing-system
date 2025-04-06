const { parentPort } = require('worker_threads');
const logger = require('../../utils/logger');

async function  enrichDataBatch(data, services) {
    const enriched = { ...data };

    for (const service of services) {
        switch (service.type) {
            case 'geolocation':
                await new Promise(resolve => setTimeout(resolve, 50));
                enriched.location = {
                    country: 'Simulated',
                    ip: data.ip
                };
                break;

            case 'demographics':
                await new Promise(resolve => setTimeout(resolve, 50));
                enriched.location = {
                    ageRange: '25-34',
                    incomeLevel: 'middle'
                };
                break;
        }
    }

    return enriched;
}

parentPort.on('message', async (task) => {
    try {
        if (task.type === 'enrich-data') {
            const result = await enrichDataBatch(task.data, task.enrichmentServices);
            parentPort.postMessage(result);
        }
    } catch (err) {
        logger.error(`Data worker error: ${err.message}`);
        process.exit(1);
    }
});
