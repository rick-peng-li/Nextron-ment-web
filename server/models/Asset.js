import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    objectKey: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    fileName: {
        type: String,
        required: true,
        trim: true,
    },
    mimeType: {
        type: String,
        default: 'application/octet-stream',
    },
    size: {
        type: Number,
        default: 0,
    },
    provider: {
        type: String,
        default: 'local',
    },
    bucket: {
        type: String,
        default: 'nextron-assets',
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
