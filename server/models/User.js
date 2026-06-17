import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
}, { _id: false });

const preferenceSchema = new mongoose.Schema({
    newsletter: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
    },
    permissionLevel: {
        type: String,
        default: 'member',
        enum: ['member', 'support', 'ops', 'super-admin'],
    },
    permissions: {
        type: [String],
        default: [],
    },
    phone: {
        type: String,
        default: '',
        trim: true,
    },
    address: {
        type: addressSchema,
        default: () => ({}),
    },
    preferences: {
        type: preferenceSchema,
        default: () => ({ newsletter: true, theme: 'dark' }),
    },
    cart: {
        type: Array,
        default: [],
    },
    wishlist: {
        type: Array,
        default: [],
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
