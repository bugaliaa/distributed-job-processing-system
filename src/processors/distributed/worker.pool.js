const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const logger = require('../utils/logger');

class WorkerPool {
    constructor(workerPath, maxWorkers = os.cpus().length) {
        this.workerPath = workerPath;
        this.maxWorkers = maxWorkers;
        this.workers = [];
        this.taskQueue = [];
        this.readyWorkers = [];

        this.init();
    };

    init() {
        for (let i = 0; i < this.maxWorkers; i++) {
            const worker = new Worker(this.workerPath);
            worker.on('message', (message) => this.handleResult(worker, message));
            worker.on('error', (error) => this.handleError(worker, error));
            worker.on('exit', (code) => this.handleExit(worker, code));

            this.workers.push(worker);
            this.readyWorkers.push(worker);
            this.processQueue();
        }
    }

    enqueueTask(task) {
        return new Promise((resolve, reject) => {
            this.taskQueue.push({ task, resolve, reject });
            this.processQueue();
        });
    }

    processQueue() {
        if (this.taskQueue.length === 0 || this.readyWorkers.length === 0) {
            return;
        }

        const { task, resolve, reject } = this.taskQueue.shift();
        const worker = this.readyWorkers.pop();

        worker.postMessage(task);

        worker.userResolve = resolve;
        worker.userReject = reject;
    }

    handleResult(worker, result) {
        if (worker.userResolve) {
            worker.userResolve(message);
            worker.userResolve = null;
            this.readyWorkers.push(worker);
            this.processQueue();
        }
    }

    handleError(worker, error) {
        logger.error(`Worker error: ${error}`);
        if (worker.userReject) {
            worker.userReject(error);
            worker.userReject = null;
        }
        this.replaceWorker(worker);
    }

    handleExit(worker, code) {
        if (code !== 0) {
            logger.error(`Worker stopped with exit code ${code}`);
            this.replaceWorker(worker);
        }
    }

    replaceWorker(worker) {
        const index = this.workers.indexOf(worker);
        if (index !== -1) {
            const newWorker = new Worker(this.workerPath);
            newWorker.on('message', (message) => this.handleResult(newWorker, message));
            newWorker.on('error', (error) => this.handleError(newWorker, error));
            newWorker.on('exit', (code) => this.handleExit(newWorker, code));

            this.workers[index] = newWorker;
            this.readyWorkers.push(newWorker);
            this.processQueue();
        }
    }

    async shutdown() {
        await Promise.all(this.workers.map(worker => worker.terminate()));
    }
}

module.exports = WorkerPool;
