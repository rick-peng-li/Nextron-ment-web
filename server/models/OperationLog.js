import mongoose from 'mongoose';

const operationLogSchema = new mongoose.Schema({
    actorId: {
        type: String,
        default: '',
    },
    actorName: {
        type: String,
        default: 'system',
    },
    action: {
        type: String,
        required: true,
    },
    targetType: {
        type: String,
        default: '',
    },
    targetId: {
        type: String,
        default: '',
    },
    summary: {
        type: String,
        default: '',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});

const OperationLog = mongoose.model('OperationLog', operationLogSchema);

export default OperationLog;
