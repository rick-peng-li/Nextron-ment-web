import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: '' },
}, { _id: false });

const customerInfoSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
}, { _id: false });

const trackingEventSchema = new mongoose.Schema({
    status: { type: String, default: 'Processing' },
    title: { type: String, default: '' },
    detail: { type: String, default: '' },
    location: { type: String, default: '' },
    time: { type: String, required: true },
}, { _id: false });

const appliedCouponSchema = new mongoose.Schema({
    code: { type: String, default: '' },
    description: { type: String, default: '' },
    discount: { type: Number, default: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: {
        type: [orderItemSchema],
        default: [],
    },
    total: {
        type: Number,
        required: true,
    },
    finalTotal: {
        type: Number,
        default: 0,
    },
    appliedCoupon: {
        type: appliedCouponSchema,
        default: () => ({ code: '', description: '', discount: 0 }),
    },
    customerInfo: {
        type: customerInfoSchema,
        required: true,
    },
    paymentMethod: {
        type: String,
        default: 'Card',
    },
    shippingMethod: {
        type: String,
        default: 'Standard Shipping',
    },
    status: {
        type: String,
        default: 'Processing',
        enum: ['Processing', 'Packed', 'Shipped', 'Delivered', 'Completed'],
    },
    trackingNumber: {
        type: String,
        default: '',
        trim: true,
    },
    trackingEvents: {
        type: [trackingEventSchema],
        default: [],
    },
    date: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
