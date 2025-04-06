const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['file-processing', 'data-enrichment', 'blockchain-verification']
    },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed', 'retrying'],
        default: 'queued'
    },
    payload: {
        type: mongoose.Schema.Types.Mixed, required: true
    },
    result: {
        type: mongoose.Schema.Types.Mixed
    },
    error: {
        type: mongoose.Schema.Types.Mixed
    },
    retries: {
        type: Number, default: 0
    },
    metadata: {
        createdAt: { type: Date, default: Date.now },
        startedAt: { type: Date },
        completedAt: { type: Date }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

JobSchema.index({ jobId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ type: 1, status: 1 });
JobSchema.index({ 'metadata.createdAt': 1 });

module.exports = mongoose.model('Jobs', JobSchema);
