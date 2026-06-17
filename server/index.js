import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import ContactMessage from './models/ContactMessage.js';
import Asset from './models/Asset.js';
import SiteConfig from './models/SiteConfig.js';
import OperationLog from './models/OperationLog.js';
import authMiddleware from './middleware/auth.js';
import { catalogCategories, seedProducts, siteContent, defaultSiteConfig } from './data/seedData.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'nextron_local_jwt_secret_change_me';
const STATUS_PIPELINE = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Completed'];
const MESSAGE_STATUS_PIPELINE = ['new', 'processing', 'resolved'];
const ALL_PERMISSIONS = [
    'products.manage',
    'orders.manage',
    'users.manage',
    'content.manage',
    'assets.manage',
    'logs.view',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadDirectory));

let databaseReady = false;

const defaultAddress = {
    line1: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
};

const defaultPreferences = {
    newsletter: true,
    theme: 'dark',
};

const memoryStore = {
    users: [],
    products: seedProducts.map((product) => ({ ...product })),
    orders: [],
    messages: [],
    siteConfig: JSON.parse(JSON.stringify(defaultSiteConfig)),
    assets: [],
    logs: [],
};

const demoAccounts = [
    {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@nextron.local',
        password: 'Demo12345!',
        role: 'user',
        permissionLevel: 'member',
        permissions: [],
        phone: '13800000001',
        address: {
            line1: '上海市浦东新区科苑路 88 号',
            city: '上海',
            state: '上海',
            zipCode: '200120',
            country: '中国',
        },
    },
    {
        id: 'demo-admin',
        name: 'Demo Admin',
        email: 'admin@nextron.local',
        password: 'Admin12345!',
        role: 'admin',
        permissionLevel: 'super-admin',
        permissions: ALL_PERMISSIONS,
        phone: '13800000002',
        address: {
            line1: '上海市浦东新区张江高科技园区 26 号',
            city: '上海',
            state: '上海',
            zipCode: '200120',
            country: '中国',
        },
    },
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const normalizePermissions = (role, permissions = []) => {
    if (role !== 'admin') return [];
    const nextPermissions = Array.isArray(permissions) ? permissions.filter((permission) => ALL_PERMISSIONS.includes(permission)) : [];
    return nextPermissions.length ? [...new Set(nextPermissions)] : [...ALL_PERMISSIONS];
};

const normalizePermissionLevel = (role, permissionLevel) => {
    if (role !== 'admin') return 'member';
    return ['support', 'ops', 'super-admin'].includes(permissionLevel) ? permissionLevel : 'super-admin';
};

const normalizeProduct = (product) => ({
    ...product,
    id: Number(product.id),
    price: Number(product.price),
    stock: Number(product.stock),
    rating: Number(product.rating || 4.5),
    badge: product.badge || '',
    brand: product.brand || 'Nextron',
    featured: Boolean(product.featured),
    trending: Boolean(product.trending),
    newArrival: Boolean(product.newArrival),
    tags: Array.isArray(product.tags) ? product.tags : [],
    specs: Array.isArray(product.specs) ? product.specs : [],
});

const normalizeUserRecord = (user) => ({
    ...user,
    role: user.role === 'admin' ? 'admin' : 'user',
    permissionLevel: normalizePermissionLevel(user.role, user.permissionLevel),
    permissions: normalizePermissions(user.role, user.permissions),
    phone: user.phone || '',
    address: { ...defaultAddress, ...(user.address || {}) },
    preferences: { ...defaultPreferences, ...(user.preferences || {}) },
    cart: Array.isArray(user.cart) ? user.cart : [],
    wishlist: Array.isArray(user.wishlist) ? user.wishlist : [],
});

const serializeUser = (user) => {
    const normalized = normalizeUserRecord(user);
    return {
        id: String(normalized._id || normalized.id),
        name: normalized.name,
        email: normalized.email,
        role: normalized.role,
        permissionLevel: normalized.permissionLevel,
        permissions: normalized.permissions,
        phone: normalized.phone,
        address: normalized.address,
        preferences: normalized.preferences,
        createdAt: normalized.createdAt || new Date().toISOString(),
    };
};

const buildTrackingEvent = (status, time = new Date().toISOString()) => {
    const locationMap = {
        Processing: '上海订单中心',
        Packed: '上海仓储中心',
        Shipped: '华东干线运输',
        Delivered: '目的地配送站',
        Completed: '用户签收完成',
    };

    const titleMap = {
        Processing: '订单已创建',
        Packed: '仓库已完成拣货',
        Shipped: '包裹已发出',
        Delivered: '包裹已送达',
        Completed: '订单已完成',
    };

    const detailMap = {
        Processing: '系统已接收订单并等待仓库处理。',
        Packed: '商品已完成打包，等待承运商揽收。',
        Shipped: '物流干线运输中，可在订单详情查看轨迹。',
        Delivered: '配送员已完成投递，请及时确认收货。',
        Completed: '订单流程完结，欢迎继续回购。',
    };

    return {
        status,
        title: titleMap[status] || '状态更新',
        detail: detailMap[status] || '订单状态已更新。',
        location: locationMap[status] || 'Nextron 服务中心',
        time,
    };
};

const normalizeTrackingEvents = (trackingEvents = [], status = 'Processing', date = new Date().toISOString()) => {
    const baseEvents = Array.isArray(trackingEvents) ? trackingEvents : [];
    if (baseEvents.length === 0) {
        return [buildTrackingEvent('Processing', date)].concat(
            status !== 'Processing' ? [buildTrackingEvent(status, new Date().toISOString())] : [],
        );
    }
    return baseEvents;
};

const serializeOrder = (order) => ({
    id: String(order._id || order.id),
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total || 0),
    finalTotal: Number(order.finalTotal || order.total || 0),
    appliedCoupon: order.appliedCoupon || { code: '', description: '', discount: 0 },
    customerInfo: order.customerInfo,
    paymentMethod: order.paymentMethod || 'Card',
    shippingMethod: order.shippingMethod || 'Standard Shipping',
    status: order.status || 'Processing',
    trackingNumber: order.trackingNumber || '',
    trackingEvents: normalizeTrackingEvents(order.trackingEvents, order.status, order.date),
    date: order.date,
    user: typeof order.user === 'object' && order.user !== null ? String(order.user._id || order.user.id) : String(order.user),
});

const serializeMessage = (message) => ({
    id: String(message._id || message.id),
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    status: message.status || 'new',
    createdAt: message.createdAt || new Date().toISOString(),
});

const serializeAsset = (asset) => ({
    id: String(asset._id || asset.id || asset.objectKey),
    objectKey: asset.objectKey,
    fileName: asset.fileName,
    mimeType: asset.mimeType || 'application/octet-stream',
    size: Number(asset.size || 0),
    provider: asset.provider || 'local',
    bucket: asset.bucket || 'nextron-assets',
    url: asset.url,
    createdBy: asset.createdBy || '',
    createdAt: asset.createdAt || new Date().toISOString(),
});

const serializeLog = (log) => ({
    id: String(log._id || log.id),
    actorId: log.actorId || '',
    actorName: log.actorName || 'system',
    action: log.action,
    targetType: log.targetType || '',
    targetId: log.targetId || '',
    summary: log.summary || '',
    metadata: log.metadata || {},
    createdAt: log.createdAt || new Date().toISOString(),
});

const serializeSiteConfig = (config) => ({
    banners: Array.isArray(config?.banners) ? config.banners : clone(defaultSiteConfig.banners),
    coupons: Array.isArray(config?.coupons) ? config.coupons : clone(defaultSiteConfig.coupons),
    recommendations: Array.isArray(config?.recommendations) ? config.recommendations : clone(defaultSiteConfig.recommendations),
});

const createToken = (user) => jwt.sign({
    user: {
        id: String(user._id || user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        permissionLevel: normalizePermissionLevel(user.role, user.permissionLevel),
        permissions: normalizePermissions(user.role, user.permissions),
    },
}, JWT_SECRET, { expiresIn: '7d' });

const ensureDemoUsers = async () => {
    if (databaseReady) {
        for (const account of demoAccounts) {
            const existing = await User.findOne({ email: account.email });
            if (!existing) {
                const password = await bcrypt.hash(account.password, 10);
                await User.create({
                    name: account.name,
                    email: account.email,
                    password,
                    role: account.role,
                    permissionLevel: account.permissionLevel,
                    permissions: account.permissions,
                    phone: account.phone,
                    address: account.address,
                    preferences: defaultPreferences,
                });
            }
        }
        return;
    }

    const users = [];
    for (const account of demoAccounts) {
        users.push({
            id: account.id,
            name: account.name,
            email: account.email,
            password: await bcrypt.hash(account.password, 10),
            role: account.role,
            permissionLevel: account.permissionLevel,
            permissions: [...account.permissions],
            phone: account.phone,
            address: account.address,
            preferences: { ...defaultPreferences },
            cart: [],
            wishlist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    memoryStore.users = users;
};

const connectDatabase = async () => {
    if (!process.env.MONGO_URI) {
        console.warn('未检测到 MONGO_URI，后端将以演示模式运行。');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        databaseReady = true;
        console.log('MongoDB 连接成功');

        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            await Product.insertMany(seedProducts.map(normalizeProduct));
        }

        const siteConfigCount = await SiteConfig.countDocuments();
        if (siteConfigCount === 0) {
            await SiteConfig.create({ key: 'default', ...defaultSiteConfig });
        }
    } catch (error) {
        databaseReady = false;
        console.warn(`MongoDB 连接失败，切换为演示模式：${error.message}`);
    }
};

const getAllProducts = async () => {
    if (databaseReady) {
        const products = await Product.find({}).sort({ id: 1 }).lean();
        return products.map(normalizeProduct);
    }
    return memoryStore.products.map((product) => ({ ...product }));
};

const applyProductFilters = (products, query = {}) => {
    const { category, search, sort = 'featured', featured, trending, newArrival, limit } = query;

    let result = [...products];

    if (category && category !== 'all') {
        result = result.filter((product) => product.category === category);
    }

    if (featured === 'true') {
        result = result.filter((product) => product.featured);
    }

    if (trending === 'true') {
        result = result.filter((product) => product.trending);
    }

    if (newArrival === 'true') {
        result = result.filter((product) => product.newArrival);
    }

    if (search) {
        const keyword = search.trim().toLowerCase();
        result = result.filter((product) => {
            const tags = Array.isArray(product.tags) ? product.tags.join(' ') : '';
            return [product.name, product.description, product.brand, product.category, tags]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }

    result.sort((left, right) => {
        if (sort === 'price-low') return left.price - right.price;
        if (sort === 'price-high') return right.price - left.price;
        if (sort === 'latest') return Number(Boolean(right.newArrival)) - Number(Boolean(left.newArrival));
        if (sort === 'rating') return right.rating - left.rating;
        return Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || right.rating - left.rating;
    });

    if (limit) {
        return result.slice(0, Number(limit));
    }

    return result;
};

const findProductById = async (id) => {
    const numericId = Number(id);
    if (databaseReady) {
        return Product.findOne({ id: numericId }).lean();
    }
    return memoryStore.products.find((product) => product.id === numericId) || null;
};

const saveProduct = async (payload, currentId) => {
    const products = await getAllProducts();
    const fallbackId = products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1;
    const productData = normalizeProduct({
        ...payload,
        id: currentId ? Number(currentId) : Number(payload.id || fallbackId),
        sku: payload.sku || `NXT-${String(currentId || fallbackId).padStart(4, '0')}`,
    });

    if (databaseReady) {
        if (currentId) {
            await Product.findOneAndUpdate({ id: Number(currentId) }, productData, { new: true, runValidators: true });
        } else {
            await Product.create(productData);
        }
        return findProductById(productData.id);
    }

    const index = memoryStore.products.findIndex((product) => product.id === productData.id);
    if (index >= 0) {
        memoryStore.products[index] = productData;
    } else {
        memoryStore.products.push(productData);
    }
    return productData;
};

const removeProduct = async (id) => {
    const numericId = Number(id);
    if (databaseReady) {
        return Product.findOneAndDelete({ id: numericId }).lean();
    }

    const index = memoryStore.products.findIndex((product) => product.id === numericId);
    if (index === -1) return null;
    const [deleted] = memoryStore.products.splice(index, 1);
    return deleted;
};

const findUserByEmail = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (databaseReady) {
        return User.findOne({ email: normalizedEmail });
    }
    return memoryStore.users.find((user) => user.email === normalizedEmail) || null;
};

const findUserById = async (id) => {
    if (databaseReady) {
        if (!isObjectId(id)) return null;
        return User.findById(id);
    }
    return memoryStore.users.find((user) => user.id === String(id)) || null;
};

const getAllUsers = async () => {
    if (databaseReady) {
        return (await User.find({}).sort({ createdAt: -1 }).lean()).map(serializeUser);
    }
    return memoryStore.users.slice().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).map(serializeUser);
};

const createUser = async ({ name, email, password, role = 'user' }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const permissionLevel = normalizePermissionLevel(role, role === 'admin' ? 'super-admin' : 'member');
    const permissions = normalizePermissions(role, role === 'admin' ? ALL_PERMISSIONS : []);

    if (databaseReady) {
        return User.create({
            name,
            email: email.trim().toLowerCase(),
            password: passwordHash,
            role,
            permissionLevel,
            permissions,
            preferences: defaultPreferences,
            address: defaultAddress,
        });
    }

    const user = {
        id: createId('user'),
        name,
        email: email.trim().toLowerCase(),
        password: passwordHash,
        role,
        permissionLevel,
        permissions,
        phone: '',
        address: { ...defaultAddress },
        preferences: { ...defaultPreferences },
        cart: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    memoryStore.users.push(user);
    return user;
};

const updateUserRecord = async (id, updates) => {
    const normalizedUpdates = {
        ...updates,
        role: updates.role ? (updates.role === 'admin' ? 'admin' : 'user') : undefined,
        permissionLevel: updates.role || updates.permissionLevel ? normalizePermissionLevel(updates.role || 'admin', updates.permissionLevel) : undefined,
        permissions: updates.role || updates.permissions ? normalizePermissions(updates.role || 'admin', updates.permissions) : undefined,
    };

    if (databaseReady) {
        return User.findByIdAndUpdate(id, normalizedUpdates, { new: true, runValidators: true });
    }

    const index = memoryStore.users.findIndex((user) => user.id === String(id));
    if (index === -1) return null;
    const current = memoryStore.users[index];
    const nextRole = normalizedUpdates.role || current.role;
    const nextUser = normalizeUserRecord({
        ...current,
        ...normalizedUpdates,
        role: nextRole,
        address: normalizedUpdates.address ? { ...defaultAddress, ...normalizedUpdates.address } : current.address,
        preferences: normalizedUpdates.preferences ? { ...defaultPreferences, ...normalizedUpdates.preferences } : current.preferences,
        updatedAt: new Date().toISOString(),
    });
    memoryStore.users[index] = nextUser;
    return nextUser;
};

const getSiteConfig = async () => {
    if (databaseReady) {
        const config = await SiteConfig.findOne({ key: 'default' }).lean();
        return serializeSiteConfig(config || defaultSiteConfig);
    }
    return serializeSiteConfig(memoryStore.siteConfig);
};

const saveSiteConfiguration = async (payload) => {
    const nextConfig = serializeSiteConfig(payload);
    if (databaseReady) {
        const config = await SiteConfig.findOneAndUpdate(
            { key: 'default' },
            { key: 'default', ...nextConfig },
            { upsert: true, new: true, runValidators: true },
        ).lean();
        return serializeSiteConfig(config);
    }

    memoryStore.siteConfig = nextConfig;
    return serializeSiteConfig(memoryStore.siteConfig);
};

const getAssets = async () => {
    if (databaseReady) {
        return (await Asset.find({}).sort({ createdAt: -1 }).lean()).map(serializeAsset);
    }
    return memoryStore.assets.slice().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).map(serializeAsset);
};

const saveAssetRecord = async (asset) => {
    if (databaseReady) {
        return serializeAsset(await Asset.create(asset));
    }

    const nextAsset = {
        id: createId('asset'),
        ...asset,
        createdAt: new Date().toISOString(),
    };
    memoryStore.assets.unshift(nextAsset);
    return serializeAsset(nextAsset);
};

const removeAssetRecord = async (id) => {
    if (databaseReady) {
        if (!isObjectId(id)) return null;
        const asset = await Asset.findByIdAndDelete(id).lean();
        return asset ? serializeAsset(asset) : null;
    }

    const index = memoryStore.assets.findIndex((asset) => String(asset.id) === String(id));
    if (index === -1) return null;
    const [removed] = memoryStore.assets.splice(index, 1);
    return serializeAsset(removed);
};

const getOperationLogs = async () => {
    if (databaseReady) {
        return (await OperationLog.find({}).sort({ createdAt: -1 }).limit(200).lean()).map(serializeLog);
    }
    return memoryStore.logs.slice().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).map(serializeLog).slice(0, 200);
};

const recordOperation = async ({ actor, action, targetType, targetId, summary, metadata = {} }) => {
    const payload = {
        actorId: actor ? String(actor._id || actor.id) : '',
        actorName: actor?.name || 'system',
        action,
        targetType,
        targetId: targetId ? String(targetId) : '',
        summary,
        metadata,
    };

    if (databaseReady) {
        await OperationLog.create(payload);
        return;
    }

    memoryStore.logs.unshift({ id: createId('log'), ...payload, createdAt: new Date().toISOString() });
};

const buildAbsoluteUrl = (req, nextPath) => {
    if (/^https?:\/\//.test(nextPath)) return nextPath;
    return `${req.protocol}://${req.get('host')}${nextPath}`;
};

const getMessages = async () => {
    if (databaseReady) {
        return (await ContactMessage.find({}).sort({ createdAt: -1 }).lean()).map(serializeMessage);
    }
    return memoryStore.messages.slice().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).map(serializeMessage);
};

const saveMessage = async (payload) => {
    if (databaseReady) {
        return serializeMessage(await ContactMessage.create(payload));
    }

    const message = {
        id: createId('msg'),
        ...payload,
        status: 'new',
        createdAt: new Date().toISOString(),
    };
    memoryStore.messages.unshift(message);
    return serializeMessage(message);
};

const updateMessageStatus = async (id, status) => {
    if (databaseReady) {
        if (!isObjectId(id)) return null;
        const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
        return message ? serializeMessage(message) : null;
    }

    const index = memoryStore.messages.findIndex((message) => message.id === String(id));
    if (index === -1) return null;
    memoryStore.messages[index] = {
        ...memoryStore.messages[index],
        status,
    };
    return serializeMessage(memoryStore.messages[index]);
};

const updateProductInventory = async (items) => {
    if (databaseReady) {
        for (const item of items) {
            const product = await Product.findOne({ id: item.id });
            if (product) {
                product.stock = Math.max(0, product.stock - Number(item.quantity || 0));
                await product.save();
            }
        }
        return;
    }

    memoryStore.products = memoryStore.products.map((product) => {
        const orderItem = items.find((item) => item.id === product.id);
        if (!orderItem) return product;
        return { ...product, stock: Math.max(0, product.stock - Number(orderItem.quantity || 0)) };
    });
};

const getOrdersByUser = async (userId) => {
    if (databaseReady) {
        return (await Order.find({ user: userId }).sort({ createdAt: -1 }).lean()).map(serializeOrder);
    }

    return memoryStore.orders.filter((order) => order.user === String(userId)).sort((left, right) => new Date(right.date) - new Date(left.date)).map(serializeOrder);
};

const getAllOrders = async () => {
    if (databaseReady) {
        return (await Order.find({}).sort({ createdAt: -1 }).lean()).map(serializeOrder);
    }
    return memoryStore.orders.slice().sort((left, right) => new Date(right.date) - new Date(left.date)).map(serializeOrder);
};

const findOrderById = async (id) => {
    if (databaseReady) {
        if (!isObjectId(id)) return null;
        const order = await Order.findById(id).lean();
        return order ? serializeOrder(order) : null;
    }
    const order = memoryStore.orders.find((item) => item.id === String(id));
    return order ? serializeOrder(order) : null;
};

const validateCoupon = async (code, subtotal) => {
    if (!code) {
        return { valid: false, message: '请输入优惠码' };
    }

    const config = await getSiteConfig();
    const coupon = config.coupons.find((item) => item.code.toLowerCase() === String(code).trim().toLowerCase() && item.status === 'active');
    if (!coupon) {
        return { valid: false, message: '优惠码不存在或未启用' };
    }

    const amount = Number(subtotal || 0);
    if (amount < Number(coupon.minAmount || 0)) {
        return { valid: false, message: `订单满 ¥${coupon.minAmount} 才可使用该优惠码` };
    }

    const discount = coupon.discountType === 'percent'
        ? Math.round(amount * (Number(coupon.value || 0) / 100))
        : Number(coupon.value || 0);

    return {
        valid: true,
        coupon,
        discount: Math.min(discount, amount),
        finalTotal: Math.max(0, amount - Math.min(discount, amount)),
    };
};

const createOrder = async (userId, payload) => {
    const couponResult = payload.couponCode
        ? await validateCoupon(payload.couponCode, payload.total)
        : { valid: false, discount: 0, finalTotal: Number(payload.total || 0) };

    const orderPayload = {
        user: userId,
        items: payload.items,
        total: Number(payload.total || 0),
        finalTotal: Number(couponResult.valid ? couponResult.finalTotal : payload.total || 0),
        appliedCoupon: couponResult.valid ? {
            code: couponResult.coupon.code,
            description: couponResult.coupon.description,
            discount: couponResult.discount,
        } : { code: '', description: '', discount: 0 },
        customerInfo: payload.customerInfo,
        paymentMethod: payload.paymentMethod || 'Card',
        shippingMethod: payload.shippingMethod || 'Standard Shipping',
        status: payload.status || 'Processing',
        trackingNumber: payload.trackingNumber || `NXT${Date.now()}`,
        trackingEvents: normalizeTrackingEvents(payload.trackingEvents, payload.status || 'Processing', payload.date || new Date().toISOString()),
        date: payload.date || new Date().toISOString(),
    };

    if (databaseReady) {
        const order = await Order.create(orderPayload);
        return serializeOrder(order);
    }

    const order = {
        id: createId('order'),
        ...orderPayload,
        user: String(userId),
        createdAt: new Date().toISOString(),
    };
    memoryStore.orders.unshift(order);
    return serializeOrder(order);
};

const updateOrderStatus = async (id, status) => {
    if (databaseReady) {
        const order = await Order.findById(id);
        if (!order) return null;
        order.status = status;
        const nextEvents = normalizeTrackingEvents(order.trackingEvents, order.status, order.date);
        if (!nextEvents.find((event) => event.status === status)) {
            nextEvents.push(buildTrackingEvent(status));
        }
        order.trackingEvents = nextEvents;
        await order.save();
        return serializeOrder(order);
    }

    const index = memoryStore.orders.findIndex((order) => order.id === String(id));
    if (index === -1) return null;
    const nextEvents = normalizeTrackingEvents(memoryStore.orders[index].trackingEvents, memoryStore.orders[index].status, memoryStore.orders[index].date);
    if (!nextEvents.find((event) => event.status === status)) {
        nextEvents.push(buildTrackingEvent(status));
    }
    memoryStore.orders[index] = { ...memoryStore.orders[index], status, trackingEvents: nextEvents };
    return serializeOrder(memoryStore.orders[index]);
};

const updateOrderFulfillment = async (id, payload) => {
    const nextStatus = STATUS_PIPELINE.includes(payload.status) ? payload.status : undefined;
    const nextTrackingNumber = String(payload.trackingNumber || '').trim();
    const nextEvent = payload.appendTrackingEvent ? {
        ...buildTrackingEvent(nextStatus || payload.appendTrackingEvent.status || 'Processing', payload.appendTrackingEvent.time || new Date().toISOString()),
        title: payload.appendTrackingEvent.title || buildTrackingEvent(nextStatus || payload.appendTrackingEvent.status || 'Processing').title,
        detail: payload.appendTrackingEvent.detail || buildTrackingEvent(nextStatus || payload.appendTrackingEvent.status || 'Processing').detail,
        location: payload.appendTrackingEvent.location || buildTrackingEvent(nextStatus || payload.appendTrackingEvent.status || 'Processing').location,
        status: payload.appendTrackingEvent.status || nextStatus || 'Processing',
        time: payload.appendTrackingEvent.time || new Date().toISOString(),
    } : null;

    if (databaseReady) {
        const order = await Order.findById(id);
        if (!order) return null;

        if (nextStatus) {
            order.status = nextStatus;
        }
        if (nextTrackingNumber) {
            order.trackingNumber = nextTrackingNumber;
        }

        const baseStatus = nextStatus || order.status;
        const nextEvents = normalizeTrackingEvents(order.trackingEvents, baseStatus, order.date);
        if (nextStatus && !nextEvents.find((event) => event.status === nextStatus)) {
            nextEvents.push(buildTrackingEvent(nextStatus));
        }
        if (nextEvent) {
            nextEvents.unshift(nextEvent);
        }
        order.trackingEvents = nextEvents;
        await order.save();
        return serializeOrder(order);
    }

    const index = memoryStore.orders.findIndex((order) => order.id === String(id));
    if (index === -1) return null;
    const currentOrder = memoryStore.orders[index];
    const baseStatus = nextStatus || currentOrder.status;
    const nextEvents = normalizeTrackingEvents(currentOrder.trackingEvents, baseStatus, currentOrder.date);
    if (nextStatus && !nextEvents.find((event) => event.status === nextStatus)) {
        nextEvents.push(buildTrackingEvent(nextStatus));
    }
    if (nextEvent) {
        nextEvents.unshift(nextEvent);
    }
    memoryStore.orders[index] = {
        ...currentOrder,
        status: baseStatus,
        trackingNumber: nextTrackingNumber || currentOrder.trackingNumber,
        trackingEvents: nextEvents,
    };
    return serializeOrder(memoryStore.orders[index]);
};

const requireAdmin = async (req, res, next) => {
    const currentUser = await findUserById(req.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: '仅管理员可访问该接口' });
    }
    req.currentUser = currentUser;
    return next();
};

const requirePermission = (permission) => async (req, res, next) => {
    const currentUser = req.currentUser || await findUserById(req.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: '仅管理员可访问该接口' });
    }

    const permissions = normalizePermissions(currentUser.role, currentUser.permissions);
    const permissionLevel = normalizePermissionLevel(currentUser.role, currentUser.permissionLevel);
    if (permissionLevel !== 'super-admin' && !permissions.includes(permission)) {
        return res.status(403).json({ message: '当前账号缺少对应权限' });
    }

    req.currentUser = currentUser;
    return next();
};

const buildCategorySummary = async () => {
    const products = await getAllProducts();
    return catalogCategories.map((category) => ({
        ...category,
        count: products.filter((product) => product.category === category.id).length,
    }));
};

const buildAdminUsers = async () => {
    const [users, orders] = await Promise.all([getAllUsers(), getAllOrders()]);
    return users.map((user) => ({
        ...user,
        orderCount: orders.filter((order) => order.user === user.id).length,
        totalSpent: orders.filter((order) => order.user === user.id).reduce((sum, order) => sum + Number(order.finalTotal || order.total || 0), 0),
    }));
};

app.get('/api/health', async (req, res) => {
    const [products, siteConfig] = await Promise.all([getAllProducts(), getSiteConfig()]);
    res.json({
        status: 'ok',
        mode: databaseReady ? 'mongodb' : 'demo',
        productCount: products.length,
        bannerCount: siteConfig.banners.length,
        couponCount: siteConfig.coupons.length,
        demoAccounts: demoAccounts.map(({ email, password, role, permissionLevel }) => ({ email, password, role, permissionLevel })),
    });
});

app.get('/api/content/home', async (req, res) => {
    const [categories, products, marketing] = await Promise.all([buildCategorySummary(), getAllProducts(), getSiteConfig()]);
    res.json({
        ...siteContent,
        categories,
        marketing,
        featuredProducts: products.filter((product) => product.featured).slice(0, 4),
        trendingProducts: products.filter((product) => product.trending).slice(0, 4),
        newArrivalProducts: products.filter((product) => product.newArrival).slice(0, 4),
    });
});

app.get('/api/products', async (req, res) => {
    const products = await getAllProducts();
    res.json(applyProductFilters(products, req.query));
});

app.get('/api/products/categories', async (req, res) => {
    res.json(await buildCategorySummary());
});

app.get('/api/products/trending', async (req, res) => {
    const products = await getAllProducts();
    res.json(applyProductFilters(products, { ...req.query, trending: 'true' }));
});

app.get('/api/products/new-arrivals', async (req, res) => {
    const products = await getAllProducts();
    res.json(applyProductFilters(products, { ...req.query, newArrival: 'true', sort: req.query.sort || 'latest' }));
});

app.get('/api/products/:id', async (req, res) => {
    const product = await findProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: '商品不存在' });
    }
    return res.json(normalizeProduct(product));
});

app.get('/api/coupons', async (req, res) => {
    const config = await getSiteConfig();
    return res.json(config.coupons.filter((coupon) => coupon.status === 'active'));
});

app.post('/api/coupons/validate', async (req, res) => {
    const result = await validateCoupon(req.body.code, req.body.total);
    if (!result.valid) {
        return res.status(400).json({ message: result.message });
    }
    return res.json({
        coupon: result.coupon,
        discount: result.discount,
        finalTotal: result.finalTotal,
        message: '优惠码可用',
    });
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || String(password).length < 6) {
            return res.status(400).json({ message: '请输入完整信息，且密码至少 6 位' });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: '该邮箱已注册' });
        }

        const user = await createUser({ name, email, password });
        return res.status(201).json({
            token: createToken(user),
            user: serializeUser(user),
        });
    } catch (error) {
        return res.status(500).json({ message: `注册失败：${error.message}` });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: '请输入邮箱和密码' });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: '用户不存在' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }

        return res.json({
            token: createToken(user),
            user: serializeUser(user),
        });
    } catch (error) {
        return res.status(500).json({ message: `登录失败：${error.message}` });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }
    return res.json({ user: serializeUser(user) });
});

app.get('/api/user/data', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }

    const orders = await getOrdersByUser(req.user.id);
    return res.json({
        profile: serializeUser(user),
        cart: user.cart || [],
        wishlist: user.wishlist || [],
        orders,
    });
});

app.get('/api/user/profile', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }
    return res.json({ profile: serializeUser(user) });
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }

    const nextUser = await updateUserRecord(req.user.id, {
        name: req.body.name || user.name,
        phone: req.body.phone || '',
        address: {
            line1: req.body.address?.line1 || '',
            city: req.body.address?.city || '',
            state: req.body.address?.state || '',
            zipCode: req.body.address?.zipCode || '',
            country: req.body.address?.country || '',
        },
        preferences: {
            newsletter: req.body.preferences?.newsletter ?? true,
            theme: req.body.preferences?.theme || user.preferences?.theme || 'dark',
        },
    });

    return res.json({ profile: serializeUser(nextUser) });
});

app.get('/api/user/dashboard', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    const orders = await getOrdersByUser(req.user.id);

    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }

    return res.json({
        totalOrders: orders.length,
        activeWishlist: (user.wishlist || []).length,
        cartItems: (user.cart || []).reduce((sum, item) => sum + Number(item.quantity || 1), 0),
        totalSpent: orders.reduce((sum, order) => sum + Number(order.finalTotal || order.total || 0), 0),
        latestOrder: orders[0] || null,
    });
});

app.put('/api/user/cart', authMiddleware, async (req, res) => {
    const cart = Array.isArray(req.body.cart) ? req.body.cart : [];
    const user = await updateUserRecord(req.user.id, { cart });
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }
    return res.json({ message: '购物车已同步', cart: user.cart || [] });
});

app.put('/api/user/wishlist', authMiddleware, async (req, res) => {
    const wishlist = Array.isArray(req.body.wishlist) ? req.body.wishlist : [];
    const user = await updateUserRecord(req.user.id, { wishlist });
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }
    return res.json({ message: '心愿单已同步', wishlist: user.wishlist || [] });
});

app.get('/api/user/orders', authMiddleware, async (req, res) => {
    return res.json(await getOrdersByUser(req.user.id));
});

app.get('/api/user/orders/:id', authMiddleware, async (req, res) => {
    const order = await findOrderById(req.params.id);
    if (!order || order.user !== String(req.user.id)) {
        return res.status(404).json({ message: '订单不存在' });
    }
    return res.json(order);
});

app.post('/api/user/order', authMiddleware, async (req, res) => {
    try {
        const { items, total, customerInfo, paymentMethod, shippingMethod, couponCode } = req.body;

        if (!Array.isArray(items) || items.length === 0 || !customerInfo?.fullName || !customerInfo?.address) {
            return res.status(400).json({ message: '订单信息不完整' });
        }

        if (couponCode) {
            const couponResult = await validateCoupon(couponCode, total);
            if (!couponResult.valid) {
                return res.status(400).json({ message: couponResult.message });
            }
        }

        await updateProductInventory(items);

        const order = await createOrder(req.user.id, {
            items,
            total: Number(total || 0),
            customerInfo,
            paymentMethod,
            shippingMethod,
            couponCode,
            date: new Date().toISOString(),
            status: 'Processing',
        });

        await updateUserRecord(req.user.id, { cart: [] });
        await recordOperation({
            actor: await findUserById(req.user.id),
            action: 'user.order.create',
            targetType: 'order',
            targetId: order.id,
            summary: `创建订单 ${order.id}`,
            metadata: { total: order.total, finalTotal: order.finalTotal, coupon: order.appliedCoupon?.code || '' },
        });

        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({ message: `下单失败：${error.message}` });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: '请完整填写联系表单' });
    }

    const saved = await saveMessage({ name, email, subject, message, status: 'new' });
    await recordOperation({
        action: 'contact.create',
        targetType: 'message',
        targetId: saved.id,
        summary: `收到联系留言：${subject}`,
        metadata: { email },
    });
    return res.status(201).json({ message: '留言已提交，我们会尽快联系你', contact: saved });
});

app.get('/api/admin/summary', authMiddleware, requireAdmin, async (req, res) => {
    const [products, orders, messages, users, assets, logs] = await Promise.all([
        getAllProducts(),
        getAllOrders(),
        getMessages(),
        getAllUsers(),
        getAssets(),
        getOperationLogs(),
    ]);

    res.json({
        metrics: {
            products: products.length,
            lowStock: products.filter((product) => product.stock <= 10).length,
            orders: orders.length,
            revenue: orders.reduce((sum, order) => sum + Number(order.finalTotal || order.total || 0), 0),
            messages: messages.length,
            users: users.length,
            assets: assets.length,
            logs: logs.length,
        },
        recentOrders: orders.slice(0, 5),
        recentMessages: messages.slice(0, 5),
        statusPipeline: STATUS_PIPELINE,
    });
});

app.get('/api/admin/orders', authMiddleware, requireAdmin, requirePermission('orders.manage'), async (req, res) => {
    return res.json(await getAllOrders());
});

app.get('/api/admin/orders/:id', authMiddleware, requireAdmin, requirePermission('orders.manage'), async (req, res) => {
    const order = await findOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: '订单不存在' });
    }
    return res.json(order);
});

app.patch('/api/admin/orders/:id/status', authMiddleware, requireAdmin, requirePermission('orders.manage'), async (req, res) => {
    const { status } = req.body;
    if (!STATUS_PIPELINE.includes(status)) {
        return res.status(400).json({ message: '无效的订单状态' });
    }

    const order = await updateOrderStatus(req.params.id, status);
    if (!order) {
        return res.status(404).json({ message: '订单不存在' });
    }

    await recordOperation({
        actor: req.currentUser,
        action: 'admin.order.status.update',
        targetType: 'order',
        targetId: order.id,
        summary: `更新订单 ${order.id} 状态为 ${status}`,
        metadata: { status },
    });

    return res.json(order);
});

app.patch('/api/admin/orders/:id/fulfillment', authMiddleware, requireAdmin, requirePermission('orders.manage'), async (req, res) => {
    const hasStatus = req.body.status !== undefined && req.body.status !== null && req.body.status !== '';
    const hasTrackingNumber = req.body.trackingNumber !== undefined;
    const hasTrackingEvent = Boolean(req.body.appendTrackingEvent);

    if (hasStatus && !STATUS_PIPELINE.includes(req.body.status)) {
        return res.status(400).json({ message: '无效的订单状态' });
    }

    if (hasTrackingEvent) {
        const trackingStatus = req.body.appendTrackingEvent.status || req.body.status || 'Processing';
        if (!STATUS_PIPELINE.includes(trackingStatus)) {
            return res.status(400).json({ message: '无效的物流节点状态' });
        }
    }

    if (!hasStatus && !hasTrackingNumber && !hasTrackingEvent) {
        return res.status(400).json({ message: '请至少提交一个履约更新字段' });
    }

    const order = await updateOrderFulfillment(req.params.id, req.body);
    if (!order) {
        return res.status(404).json({ message: '订单不存在' });
    }

    await recordOperation({
        actor: req.currentUser,
        action: 'admin.order.fulfillment.update',
        targetType: 'order',
        targetId: order.id,
        summary: `更新订单 ${order.id} 履约信息`,
        metadata: {
            status: req.body.status || order.status,
            trackingNumber: req.body.trackingNumber || order.trackingNumber,
            appendedStatus: req.body.appendTrackingEvent?.status || '',
        },
    });

    return res.json(order);
});

app.get('/api/admin/users', authMiddleware, requireAdmin, requirePermission('users.manage'), async (req, res) => {
    return res.json(await buildAdminUsers());
});

app.put('/api/admin/users/:id', authMiddleware, requireAdmin, requirePermission('users.manage'), async (req, res) => {
    const existing = await findUserById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: '用户不存在' });
    }

    const updated = await updateUserRecord(req.params.id, {
        name: req.body.name || existing.name,
        phone: req.body.phone || existing.phone || '',
        role: req.body.role || existing.role,
        permissionLevel: req.body.permissionLevel || existing.permissionLevel,
        permissions: Array.isArray(req.body.permissions) ? req.body.permissions : existing.permissions,
    });

    await recordOperation({
        actor: req.currentUser,
        action: 'admin.user.update',
        targetType: 'user',
        targetId: req.params.id,
        summary: `更新用户 ${updated.email} 权限信息`,
        metadata: { role: updated.role, permissionLevel: updated.permissionLevel },
    });

    return res.json(serializeUser(updated));
});

app.get('/api/admin/site-config', authMiddleware, requireAdmin, requirePermission('content.manage'), async (req, res) => {
    return res.json(await getSiteConfig());
});

app.put('/api/admin/site-config', authMiddleware, requireAdmin, requirePermission('content.manage'), async (req, res) => {
    const nextConfig = await saveSiteConfiguration(req.body);
    await recordOperation({
        actor: req.currentUser,
        action: 'admin.site-config.update',
        targetType: 'site-config',
        targetId: 'default',
        summary: '更新优惠券、Banner 与推荐位配置',
        metadata: {
            banners: nextConfig.banners.length,
            coupons: nextConfig.coupons.length,
            recommendations: nextConfig.recommendations.length,
        },
    });
    return res.json(nextConfig);
});

app.get('/api/admin/assets', authMiddleware, requireAdmin, requirePermission('assets.manage'), async (req, res) => {
    return res.json(await getAssets());
});

app.post('/api/admin/assets/upload', authMiddleware, requireAdmin, requirePermission('assets.manage'), async (req, res) => {
    const { fileName, dataUrl, remoteUrl } = req.body;
    if (!fileName && !remoteUrl) {
        return res.status(400).json({ message: '请提供素材名称或远程地址' });
    }

    let assetPayload;

    if (remoteUrl) {
        assetPayload = {
            objectKey: createId('remote-asset'),
            fileName: fileName || path.basename(remoteUrl),
            mimeType: 'image/remote',
            size: 0,
            provider: 'remote',
            bucket: 'remote-reference',
            url: remoteUrl,
            createdBy: req.currentUser.email,
        };
    } else {
        const match = String(dataUrl || '').match(/^data:(.+);base64,(.+)$/);
        if (!match) {
            return res.status(400).json({ message: '上传内容格式不正确' });
        }

        const mimeType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const safeName = (fileName || `asset-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '-');
        const objectKey = `${Date.now()}-${safeName}`;
        const outputPath = path.join(uploadDirectory, objectKey);
        await fs.writeFile(outputPath, buffer);

        assetPayload = {
            objectKey,
            fileName: safeName,
            mimeType,
            size: buffer.length,
            provider: process.env.STORAGE_PROVIDER || 'local',
            bucket: process.env.STORAGE_BUCKET || 'nextron-local',
            url: buildAbsoluteUrl(req, `/uploads/${objectKey}`),
            createdBy: req.currentUser.email,
        };
    }

    const asset = await saveAssetRecord(assetPayload);
    await recordOperation({
        actor: req.currentUser,
        action: 'admin.asset.upload',
        targetType: 'asset',
        targetId: asset.id,
        summary: `上传素材 ${asset.fileName}`,
        metadata: { provider: asset.provider, size: asset.size },
    });

    return res.status(201).json(asset);
});

app.delete('/api/admin/assets/:id', authMiddleware, requireAdmin, requirePermission('assets.manage'), async (req, res) => {
    const asset = await removeAssetRecord(req.params.id);
    if (!asset) {
        return res.status(404).json({ message: '素材不存在' });
    }

    if (asset.provider !== 'remote' && asset.objectKey) {
        const filePath = path.join(uploadDirectory, asset.objectKey);
        await fs.rm(filePath, { force: true });
    }

    await recordOperation({
        actor: req.currentUser,
        action: 'admin.asset.delete',
        targetType: 'asset',
        targetId: asset.id,
        summary: `删除素材 ${asset.fileName}`,
        metadata: { provider: asset.provider, objectKey: asset.objectKey },
    });

    return res.json({ message: '素材已删除' });
});

app.get('/api/admin/logs', authMiddleware, requireAdmin, requirePermission('logs.view'), async (req, res) => {
    return res.json(await getOperationLogs());
});

app.post('/api/admin/products', authMiddleware, requireAdmin, requirePermission('products.manage'), async (req, res) => {
    const requiredFields = ['name', 'category', 'price', 'image', 'description', 'stock'];
    const missing = requiredFields.find((field) => req.body[field] === undefined || req.body[field] === '');
    if (missing) {
        return res.status(400).json({ message: `缺少字段：${missing}` });
    }

    const product = await saveProduct(req.body);
    await recordOperation({
        actor: req.currentUser,
        action: 'admin.product.create',
        targetType: 'product',
        targetId: product.id,
        summary: `新增商品 ${product.name}`,
        metadata: { category: product.category, price: product.price },
    });
    return res.status(201).json(normalizeProduct(product));
});

app.put('/api/admin/products/:id', authMiddleware, requireAdmin, requirePermission('products.manage'), async (req, res) => {
    const existing = await findProductById(req.params.id);
    if (!existing) {
        return res.status(404).json({ message: '商品不存在' });
    }

    const product = await saveProduct({ ...existing, ...req.body }, req.params.id);
    await recordOperation({
        actor: req.currentUser,
        action: 'admin.product.update',
        targetType: 'product',
        targetId: product.id,
        summary: `更新商品 ${product.name}`,
        metadata: { category: product.category, price: product.price },
    });
    return res.json(normalizeProduct(product));
});

app.delete('/api/admin/products/:id', authMiddleware, requireAdmin, requirePermission('products.manage'), async (req, res) => {
    const deleted = await removeProduct(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: '商品不存在' });
    }
    await recordOperation({
        actor: req.currentUser,
        action: 'admin.product.delete',
        targetType: 'product',
        targetId: req.params.id,
        summary: `删除商品 ${deleted.name}`,
        metadata: { category: deleted.category },
    });
    return res.json({ message: '商品已删除' });
});

app.get('/api/admin/messages', authMiddleware, requireAdmin, requirePermission('content.manage'), async (req, res) => {
    return res.json(await getMessages());
});

app.patch('/api/admin/messages/:id/status', authMiddleware, requireAdmin, requirePermission('content.manage'), async (req, res) => {
    const { status } = req.body;
    if (!MESSAGE_STATUS_PIPELINE.includes(status)) {
        return res.status(400).json({ message: '无效的留言状态' });
    }

    const message = await updateMessageStatus(req.params.id, status);
    if (!message) {
        return res.status(404).json({ message: '留言不存在' });
    }

    await recordOperation({
        actor: req.currentUser,
        action: 'admin.message.status.update',
        targetType: 'message',
        targetId: message.id,
        summary: `更新留言 ${message.subject} 状态为 ${status}`,
        metadata: { status, email: message.email },
    });

    return res.json(message);
});

app.use((req, res) => {
    res.status(404).json({ message: '接口不存在' });
});

const startServer = async () => {
    await fs.mkdir(uploadDirectory, { recursive: true });
    await connectDatabase();
    await ensureDemoUsers();
    app.listen(PORT, () => {
        console.log(`Nextron server started on port ${PORT}`);
    });
};

startServer();
