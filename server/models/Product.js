import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        default: 'Nextron',
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    badge: {
        type: String,
        default: '',
        trim: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    trending: {
        type: Boolean,
        default: false,
    },
    newArrival: {
        type: Boolean,
        default: false,
    },
    tags: {
        type: [String],
        default: [],
    },
    specs: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
