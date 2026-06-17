import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, PRODUCTS_DATA, SITE_CONTENT, DEFAULT_SITE_CONFIG } from '../data';

const StoreContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const STATUS_PIPELINE = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Completed'];
const MESSAGE_STATUS_PIPELINE = ['new', 'processing', 'resolved'];
const ALL_PERMISSIONS = ['products.manage', 'orders.manage', 'users.manage', 'content.manage', 'assets.manage', 'logs.view'];

const defaultProfile = {
    name: '',
    email: '',
    role: 'user',
    permissionLevel: 'member',
    permissions: [],
    phone: '',
    address: {
        line1: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    },
    preferences: {
        newsletter: true,
        theme: 'dark',
    },
};

const defaultAdminStats = {
    metrics: {
        products: PRODUCTS_DATA.length,
        lowStock: PRODUCTS_DATA.filter((product) => product.stock <= 10).length,
        orders: 0,
        revenue: 0,
        messages: 0,
        users: 0,
        assets: 0,
        logs: 0,
    },
    recentOrders: [],
    recentMessages: [],
    statusPipeline: STATUS_PIPELINE,
};

const request = async (path, options = {}) => {
    const hasTokenOverride = Object.prototype.hasOwnProperty.call(options, 'token');
    const token = hasTokenOverride ? options.token : localStorage.getItem('nextron_token');
    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { 'x-auth-token': token } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        throw new Error(data?.message || '请求失败');
    }

    return data;
};

const normalizeProfile = (profile) => ({
    ...defaultProfile,
    ...profile,
    address: {
        ...defaultProfile.address,
        ...(profile?.address || {}),
    },
    preferences: {
        ...defaultProfile.preferences,
        ...(profile?.preferences || {}),
    },
    permissions: Array.isArray(profile?.permissions) ? profile.permissions : [],
});

const normalizeSiteConfig = (siteConfig) => ({
    banners: Array.isArray(siteConfig?.banners) ? siteConfig.banners : DEFAULT_SITE_CONFIG.banners,
    coupons: Array.isArray(siteConfig?.coupons) ? siteConfig.coupons : DEFAULT_SITE_CONFIG.coupons,
    recommendations: Array.isArray(siteConfig?.recommendations) ? siteConfig.recommendations : DEFAULT_SITE_CONFIG.recommendations,
});

const buildTrackingEvents = (status = 'Processing', date = new Date().toISOString()) => {
    const eventMap = {
        Processing: { title: '订单已创建', detail: '系统已接收订单并等待仓库处理。', location: '上海订单中心' },
        Packed: { title: '仓库已完成拣货', detail: '商品已完成打包，等待承运商揽收。', location: '上海仓储中心' },
        Shipped: { title: '包裹已发出', detail: '物流干线运输中，可在订单详情查看轨迹。', location: '华东干线运输' },
        Delivered: { title: '包裹已送达', detail: '配送员已完成投递，请及时确认收货。', location: '目的地配送站' },
        Completed: { title: '订单已完成', detail: '订单流程完结，欢迎继续回购。', location: '用户签收完成' },
    };

    const statuses = STATUS_PIPELINE.slice(0, Math.max(1, STATUS_PIPELINE.indexOf(status) + 1));
    return statuses.map((currentStatus, index) => ({
        status: currentStatus,
        title: eventMap[currentStatus].title,
        detail: eventMap[currentStatus].detail,
        location: eventMap[currentStatus].location,
        time: new Date(new Date(date).getTime() + index * 60 * 60 * 1000).toISOString(),
    }));
};

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState(PRODUCTS_DATA);
    const [categories, setCategories] = useState(CATEGORIES);
    const [homeContent, setHomeContent] = useState(SITE_CONTENT);
    const [siteConfig, setSiteConfig] = useState(DEFAULT_SITE_CONFIG);
    const [adminOrders, setAdminOrders] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminStats, setAdminStats] = useState(defaultAdminStats);
    const [contactMessages, setContactMessages] = useState([]);
    const [assets, setAssets] = useState([]);
    const [operationLogs, setOperationLogs] = useState([]);
    const [profile, setProfile] = useState(defaultProfile);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('nextron_user');
        return savedUser ? normalizeProfile(JSON.parse(savedUser)) : null;
    });

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('nextron_theme');
        const savedUser = localStorage.getItem('nextron_user');
        if (savedTheme) return savedTheme;
        if (savedUser) {
            return normalizeProfile(JSON.parse(savedUser)).preferences.theme;
        }
        return 'dark';
    });

    const persistUser = useCallback((nextUser) => {
        if (!nextUser) {
            localStorage.removeItem('nextron_user');
            setUser(null);
            setProfile(defaultProfile);
            return;
        }

        const normalized = normalizeProfile(nextUser);
        localStorage.setItem('nextron_user', JSON.stringify(normalized));
        setUser(normalized);
        setProfile(normalized);
        setTheme(normalized.preferences.theme || 'dark');
    }, []);

    const refreshCatalog = useCallback(async () => {
        try {
            const [productsResult, categoriesResult, contentResult] = await Promise.all([
                request('/api/products'),
                request('/api/products/categories'),
                request('/api/content/home'),
            ]);

            const nextSiteConfig = normalizeSiteConfig(contentResult?.marketing);
            setProducts(productsResult?.length ? productsResult : PRODUCTS_DATA);
            setCategories(categoriesResult?.length ? categoriesResult : CATEGORIES);
            setSiteConfig(nextSiteConfig);
            setHomeContent({
                ...SITE_CONTENT,
                ...(contentResult || {}),
                marketing: nextSiteConfig,
            });
        } catch (error) {
            setProducts(PRODUCTS_DATA);
            setCategories(CATEGORIES);
            setSiteConfig(DEFAULT_SITE_CONFIG);
            setHomeContent({
                ...SITE_CONTENT,
                marketing: DEFAULT_SITE_CONFIG,
            });
        }
    }, []);

    const refreshAdminData = useCallback(async () => {
        try {
            const [summary, ordersResult, usersResult, messagesResult, siteConfigResult, assetsResult, logsResult] = await Promise.all([
                request('/api/admin/summary'),
                request('/api/admin/orders'),
                request('/api/admin/users'),
                request('/api/admin/messages'),
                request('/api/admin/site-config'),
                request('/api/admin/assets'),
                request('/api/admin/logs'),
            ]);
            const nextSiteConfig = normalizeSiteConfig(siteConfigResult);
            setAdminStats(summary || defaultAdminStats);
            setAdminOrders(ordersResult || []);
            setAdminUsers(usersResult || []);
            setContactMessages(messagesResult || []);
            setSiteConfig(nextSiteConfig);
            setAssets(assetsResult || []);
            setOperationLogs(logsResult || []);
            setHomeContent((current) => ({
                ...current,
                marketing: nextSiteConfig,
            }));
        } catch (error) {
            setAdminOrders([]);
            setAdminUsers([]);
            setContactMessages([]);
            setAssets([]);
            setOperationLogs([]);
        }
    }, []);

    const refreshUserData = useCallback(async () => {
        if (!localStorage.getItem('nextron_token')) {
            setCart([]);
            setWishlist([]);
            setOrders([]);
            setProfile(user || defaultProfile);
            return;
        }

        try {
            const data = await request('/api/user/data');
            setCart(Array.isArray(data.cart) ? data.cart : []);
            setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
            setOrders(Array.isArray(data.orders) ? data.orders : []);
            persistUser(data.profile || user);
            if ((data.profile || user)?.role === 'admin') {
                await refreshAdminData();
            }
        } catch (error) {
            localStorage.removeItem('nextron_token');
            persistUser(null);
            setCart([]);
            setWishlist([]);
            setOrders([]);
        }
    }, [persistUser, refreshAdminData, user]);

    useEffect(() => {
        refreshCatalog().finally(() => setIsInitializing(false));
    }, [refreshCatalog]);

    useEffect(() => {
        if (user) {
            refreshUserData();
        } else {
            setCart([]);
            setWishlist([]);
            setOrders([]);
            setProfile(defaultProfile);
        }
    }, [user?.id, refreshUserData]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nextron_theme', theme);
    }, [theme]);

    useEffect(() => {
        setIsAdminMode(Boolean(user?.role === 'admin'));
    }, [user]);

    const featuredProducts = useMemo(() => products.filter((product) => product.featured), [products]);
    const trendingProducts = useMemo(() => products.filter((product) => product.trending), [products]);
    const newArrivalProducts = useMemo(() => products.filter((product) => product.newArrival), [products]);

    const recommendationSections = useMemo(() => (
        (siteConfig.recommendations || []).map((recommendation) => ({
            ...recommendation,
            products: products.filter((product) => recommendation.productIds.includes(product.id)),
        }))
    ), [products, siteConfig.recommendations]);

    const activeCoupons = useMemo(() => (siteConfig.coupons || []).filter((coupon) => coupon.status === 'active'), [siteConfig.coupons]);
    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity), 0), [cart]);

    const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));

    const navigateToCategory = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
    };

    const syncCollection = async (path, nextCollection, setter, key) => {
        setter(nextCollection);
        if (!user) return;
        try {
            setIsSyncing(true);
            await request(path, {
                method: 'PUT',
                body: { [key]: nextCollection },
            });
        } catch (error) {
            console.error(error);
            await refreshUserData();
        } finally {
            setIsSyncing(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find((item) => item.id === product.id);
        const nextCart = existing
            ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            : [...cart, { ...product, quantity: 1 }];

        setIsCartOpen(true);
        syncCollection('/api/user/cart', nextCart, setCart, 'cart');
    };

    const removeFromCart = (productId) => {
        const nextCart = cart.filter((item) => item.id !== productId);
        syncCollection('/api/user/cart', nextCart, setCart, 'cart');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const nextCart = cart.map((item) => item.id === productId ? { ...item, quantity } : item);
        syncCollection('/api/user/cart', nextCart, setCart, 'cart');
    };

    const addToWishlist = (product) => {
        if (wishlist.find((item) => item.id === product.id)) return;
        const nextWishlist = [...wishlist, product];
        syncCollection('/api/user/wishlist', nextWishlist, setWishlist, 'wishlist');
    };

    const removeFromWishlist = (productId) => {
        const nextWishlist = wishlist.filter((item) => item.id !== productId);
        syncCollection('/api/user/wishlist', nextWishlist, setWishlist, 'wishlist');
    };

    const signup = async (email, password, name) => {
        try {
            const data = await request('/api/auth/signup', {
                method: 'POST',
                body: { name, email, password },
                token: '',
            });
            localStorage.setItem('nextron_token', data.token);
            persistUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            const data = await request('/api/auth/login', {
                method: 'POST',
                body: { email, password },
                token: '',
            });
            localStorage.setItem('nextron_token', data.token);
            persistUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('nextron_token');
        persistUser(null);
        setCart([]);
        setWishlist([]);
        setOrders([]);
        setAdminOrders([]);
        setAdminUsers([]);
        setContactMessages([]);
        setAssets([]);
        setOperationLogs([]);
        setIsAdminMode(false);
    };

    const validateCoupon = async (code, total) => {
        const data = await request('/api/coupons/validate', {
            method: 'POST',
            body: { code, total },
            token: '',
        });
        return data;
    };

    const placeOrder = async (orderData) => {
        const payload = {
            items: cart,
            total: cartTotal,
            customerInfo: {
                fullName: orderData.fullName,
                email: orderData.email,
                phone: orderData.phone,
                address: orderData.address,
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zipCode,
                country: orderData.country,
            },
            paymentMethod: 'Card',
            shippingMethod: orderData.shipping || 'Standard Shipping',
            couponCode: orderData.couponCode || '',
            date: new Date().toISOString(),
        };

        if (user) {
            const order = await request('/api/user/order', {
                method: 'POST',
                body: payload,
            });
            setOrders((currentOrders) => [order, ...currentOrders]);
            setCart([]);
            await refreshCatalog();
            await refreshUserData();
            if (user.role === 'admin') {
                await refreshAdminData();
            }
            return order;
        }

        const discount = orderData.appliedCoupon?.discount || 0;
        const fallbackOrder = {
            id: `guest-${Date.now()}`,
            ...payload,
            status: 'Processing',
            trackingNumber: `NXT${Date.now()}`,
            trackingEvents: buildTrackingEvents('Processing', payload.date),
            appliedCoupon: orderData.appliedCoupon || { code: '', description: '', discount: 0 },
            finalTotal: Math.max(0, cartTotal - discount),
        };
        setOrders((currentOrders) => [fallbackOrder, ...currentOrders]);
        setCart([]);
        return fallbackOrder;
    };

    const fetchOrderDetail = async (orderId) => {
        if (user) {
            return request(`/api/user/orders/${orderId}`);
        }
        return orders.find((order) => order.id === orderId) || null;
    };

    const fetchAdminOrderDetail = async (orderId) => request(`/api/admin/orders/${orderId}`);

    const updateProfile = async (formData) => {
        const data = await request('/api/user/profile', {
            method: 'PUT',
            body: formData,
        });
        persistUser(data.profile);
        return data.profile;
    };

    const submitContact = async (payload) => request('/api/contact', {
        method: 'POST',
        body: payload,
        token: '',
    });

    const saveProduct = async (payload) => {
        const path = payload.id ? `/api/admin/products/${payload.id}` : '/api/admin/products';
        const method = payload.id ? 'PUT' : 'POST';
        await request(path, { method, body: payload });
        await refreshCatalog();
        await refreshAdminData();
    };

    const deleteProduct = async (productId) => {
        await request(`/api/admin/products/${productId}`, { method: 'DELETE' });
        await refreshCatalog();
        await refreshAdminData();
    };

    const updateOrderStatus = async (orderId, status) => {
        const order = await request(`/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: { status },
        });
        await refreshAdminData();
        if (user) {
            await refreshUserData();
        }
        return order;
    };

    const updateOrderFulfillment = async (orderId, payload) => {
        const order = await request(`/api/admin/orders/${orderId}/fulfillment`, {
            method: 'PATCH',
            body: payload,
        });
        await refreshAdminData();
        if (user) {
            await refreshUserData();
        }
        return order;
    };

    const saveAdminUser = async (payload) => {
        const data = await request(`/api/admin/users/${payload.id}`, {
            method: 'PUT',
            body: payload,
        });
        await refreshAdminData();
        if (String(payload.id) === String(user?.id)) {
            persistUser(data);
        }
        return data;
    };

    const saveMarketingConfig = async (payload) => {
        const data = await request('/api/admin/site-config', {
            method: 'PUT',
            body: payload,
        });
        const nextSiteConfig = normalizeSiteConfig(data);
        setSiteConfig(nextSiteConfig);
        setHomeContent((current) => ({
            ...current,
            marketing: nextSiteConfig,
        }));
        await refreshAdminData();
        return nextSiteConfig;
    };

    const uploadAsset = async (payload) => {
        const asset = await request('/api/admin/assets/upload', {
            method: 'POST',
            body: payload,
        });
        await refreshAdminData();
        return asset;
    };

    const deleteAsset = async (assetId) => {
        await request(`/api/admin/assets/${assetId}`, {
            method: 'DELETE',
        });
        await refreshAdminData();
    };

    const updateMessageStatus = async (messageId, status) => {
        const message = await request(`/api/admin/messages/${messageId}/status`, {
            method: 'PATCH',
            body: { status },
        });
        await refreshAdminData();
        return message;
    };

    return (
        <StoreContext.Provider value={{
            cart,
            wishlist,
            orders,
            products,
            categories,
            homeContent,
            siteConfig,
            featuredProducts,
            trendingProducts,
            newArrivalProducts,
            recommendationSections,
            activeCoupons,
            adminOrders,
            adminUsers,
            adminStats,
            contactMessages,
            assets,
            operationLogs,
            profile,
            isInitializing,
            isSyncing,
            isCartOpen,
            isWishlistOpen,
            isCheckoutOpen,
            isAdminMode,
            user,
            theme,
            cartTotal,
            cartCount,
            statusPipeline: STATUS_PIPELINE,
            messageStatuses: MESSAGE_STATUS_PIPELINE,
            allPermissions: ALL_PERMISSIONS,
            setProducts,
            setIsCartOpen,
            setIsWishlistOpen,
            setIsCheckoutOpen,
            setIsAdminMode,
            toggleTheme,
            navigateToCategory,
            addToCart,
            removeFromCart,
            updateQuantity,
            addToWishlist,
            removeFromWishlist,
            signup,
            login,
            logout,
            validateCoupon,
            placeOrder,
            fetchOrderDetail,
            fetchAdminOrderDetail,
            updateProfile,
            submitContact,
            refreshCatalog,
            refreshUserData,
            refreshAdminData,
            saveProduct,
            deleteProduct,
            updateOrderStatus,
            updateOrderFulfillment,
            saveAdminUser,
            saveMarketingConfig,
            uploadAsset,
            deleteAsset,
            updateMessageStatus,
        }}>
            {children}
        </StoreContext.Provider>
    );
};
