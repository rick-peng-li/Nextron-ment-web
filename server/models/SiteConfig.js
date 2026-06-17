import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '/' },
    active: { type: Boolean, default: true },
}, { _id: false });

const couponSchema = new mongoose.Schema({
    id: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, default: '' },
    discountType: { type: String, default: 'amount' },
    value: { type: Number, default: 0 },
    minAmount: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
}, { _id: false });

const recommendationSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    productIds: { type: [Number], default: [] },
}, { _id: false });

const siteConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'default',
    },
    banners: {
        type: [bannerSchema],
        default: [],
    },
    coupons: {
        type: [couponSchema],
        default: [],
    },
    recommendations: {
        type: [recommendationSchema],
        default: [],
    },
}, {
    timestamps: true,
});

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export default SiteConfig;
