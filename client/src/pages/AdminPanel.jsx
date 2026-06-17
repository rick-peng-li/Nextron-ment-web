import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const emptyProductForm = {
    id: '',
    name: '',
    category: 'headphones',
    brand: 'Nextron',
    price: '',
    image: '',
    description: '',
    stock: '',
    rating: 4.5,
    badge: '',
    featured: false,
    trending: false,
    newArrival: false,
    tags: '',
    specs: '',
};

const createEmptyMarketingConfig = () => ({
    banners: [],
    coupons: [],
    recommendations: [],
});

const AdminPanel = () => {
    const {
        categories,
        products,
        adminOrders,
        adminUsers,
        adminStats,
        contactMessages,
        siteConfig,
        assets,
        operationLogs,
        user,
        allPermissions,
        statusPipeline,
        messageStatuses,
        saveProduct,
        deleteProduct,
        updateOrderStatus,
        updateOrderFulfillment,
        saveAdminUser,
        saveMarketingConfig,
        uploadAsset,
        deleteAsset,
        updateMessageStatus,
    } = useStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [productForm, setProductForm] = useState(emptyProductForm);
    const [message, setMessage] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userForm, setUserForm] = useState(null);
    const [marketingForm, setMarketingForm] = useState(createEmptyMarketingConfig());
    const [uploadForm, setUploadForm] = useState({ fileName: '', remoteUrl: '', dataUrl: '' });
    const [uploadMessage, setUploadMessage] = useState('');
    const [orderForms, setOrderForms] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        setMarketingForm({
            banners: Array.isArray(siteConfig?.banners) ? siteConfig.banners : [],
            coupons: Array.isArray(siteConfig?.coupons) ? siteConfig.coupons : [],
            recommendations: Array.isArray(siteConfig?.recommendations) ? siteConfig.recommendations : [],
        });
    }, [siteConfig]);

    useEffect(() => {
        if (!selectedUserId && adminUsers.length > 0) {
            setSelectedUserId(adminUsers[0].id);
            return;
        }
        const selected = adminUsers.find((item) => item.id === selectedUserId);
        if (selected) {
            setUserForm({
                id: selected.id,
                name: selected.name,
                phone: selected.phone || '',
                role: selected.role,
                permissionLevel: selected.permissionLevel || 'member',
                permissions: Array.isArray(selected.permissions) ? selected.permissions : [],
            });
        }
    }, [adminUsers, selectedUserId]);

    useEffect(() => {
        setOrderForms(
            adminOrders.reduce((accumulator, order) => ({
                ...accumulator,
                [order.id]: {
                    status: order.status,
                    trackingNumber: order.trackingNumber || '',
                    eventStatus: order.status,
                    eventTitle: '',
                    eventDetail: '',
                    eventLocation: '',
                },
            }), {}),
        );
    }, [adminOrders]);

    const lowStockProducts = useMemo(() => products.filter((product) => product.stock <= 10), [products]);
    const latestLogs = useMemo(() => operationLogs.slice(0, 8), [operationLogs]);

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 max-w-lg">
                    <h2 className="text-3xl font-bold mb-4">仅管理员可访问后台</h2>
                    <p className="text-gray-400 mb-8">请使用管理员演示账号登录后查看商品、订单、用户、运营配置与素材管理能力。</p>
                    <button onClick={() => navigate('/login')} className="btn-primary px-6 py-3 rounded-full">前往登录</button>
                </div>
            </div>
        );
    }

    const handleProductChange = (event) => {
        const { name, value, type, checked } = event.target;
        setProductForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEditProduct = (product) => {
        setProductForm({
            ...product,
            tags: (product.tags || []).join(', '),
            specs: (product.specs || []).join(', '),
        });
        setActiveTab('products');
    };

    const handleSaveProduct = async (event) => {
        event.preventDefault();
        setMessage('');
        try {
            await saveProduct({
                ...productForm,
                price: Number(productForm.price),
                stock: Number(productForm.stock),
                rating: Number(productForm.rating),
                tags: productForm.tags.split(',').map((item) => item.trim()).filter(Boolean),
                specs: productForm.specs.split(',').map((item) => item.trim()).filter(Boolean),
            });
            setMessage('商品已保存');
            setProductForm(emptyProductForm);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleUserPermissionToggle = (permission) => {
        setUserForm((current) => ({
            ...current,
            permissions: current.permissions.includes(permission)
                ? current.permissions.filter((item) => item !== permission)
                : [...current.permissions, permission],
        }));
    };

    const handleSaveUser = async () => {
        if (!userForm) return;
        setMessage('');
        try {
            await saveAdminUser(userForm);
            setMessage('用户权限已更新');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleOrderFormChange = (orderId, field, value) => {
        setOrderForms((current) => ({
            ...current,
            [orderId]: {
                ...current[orderId],
                [field]: value,
            },
        }));
    };

    const handleSaveOrderFlow = async (orderId) => {
        const form = orderForms[orderId];
        if (!form) return;
        setMessage('');
        try {
            await updateOrderFulfillment(orderId, {
                status: form.status,
                trackingNumber: form.trackingNumber,
                appendTrackingEvent: form.eventTitle || form.eventDetail || form.eventLocation ? {
                    status: form.eventStatus || form.status,
                    title: form.eventTitle,
                    detail: form.eventDetail,
                    location: form.eventLocation,
                } : undefined,
            });
            setMessage('订单履约信息已更新');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleMarketingItemChange = (section, index, field, value) => {
        setMarketingForm((current) => ({
            ...current,
            [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
        }));
    };

    const handleRecommendationProductsChange = (index, value) => {
        setMarketingForm((current) => ({
            ...current,
            recommendations: current.recommendations.map((item, itemIndex) => itemIndex === index ? {
                ...item,
                productIds: value.split(',').map((id) => Number(id.trim())).filter(Boolean),
            } : item),
        }));
    };

    const handleAddMarketingItem = (section) => {
        const defaults = {
            banners: { id: `banner-${Date.now()}`, title: '', subtitle: '', image: '', link: '/products', active: true },
            coupons: { id: `coupon-${Date.now()}`, code: '', description: '', discountType: 'amount', value: 0, minAmount: 0, status: 'active' },
            recommendations: { id: `recommendation-${Date.now()}`, title: '', description: '', productIds: [] },
        };

        setMarketingForm((current) => ({
            ...current,
            [section]: [...current[section], defaults[section]],
        }));
    };

    const handleRemoveMarketingItem = (section, index) => {
        setMarketingForm((current) => ({
            ...current,
            [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleSaveMarketing = async () => {
        setMessage('');
        try {
            await saveMarketingConfig(marketingForm);
            setMessage('运营配置已更新');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setUploadForm({
                fileName: file.name,
                remoteUrl: '',
                dataUrl: String(reader.result || ''),
            });
        };
        reader.readAsDataURL(file);
    };

    const handleUploadAsset = async () => {
        setUploadMessage('');
        try {
            await uploadAsset(uploadForm.remoteUrl ? {
                fileName: uploadForm.fileName,
                remoteUrl: uploadForm.remoteUrl,
            } : {
                fileName: uploadForm.fileName,
                dataUrl: uploadForm.dataUrl,
            });
            setUploadForm({ fileName: '', remoteUrl: '', dataUrl: '' });
            setUploadMessage('素材已上传');
        } catch (error) {
            setUploadMessage(error.message);
        }
    };

    const handleDeleteAsset = async (assetId) => {
        setUploadMessage('');
        try {
            await deleteAsset(assetId);
            setUploadMessage('素材已删除');
        } catch (error) {
            setUploadMessage(error.message);
        }
    };

    const handleMessageStatusChange = async (messageId, status) => {
        setMessage('');
        try {
            await updateMessageStatus(messageId, status);
            setMessage('留言状态已更新');
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
                    <div>
                        <h2 className="text-5xl font-black mb-4">后台 <span className="text-[var(--accent)]">管理</span></h2>
                        <p className="text-gray-400">已接入商品维护、订单状态、用户权限、运营配置、素材上传与操作日志等完整流程。</p>
                    </div>
                    <div className="text-sm text-gray-500">当前身份：{user.name} · {user.permissionLevel}</div>
                </div>

                <div className="grid md:grid-cols-4 xl:grid-cols-8 gap-4 mb-10">
                    {[
                        { label: '商品数', value: adminStats.metrics.products },
                        { label: '低库存', value: adminStats.metrics.lowStock },
                        { label: '订单数', value: adminStats.metrics.orders },
                        { label: '营收', value: `¥${adminStats.metrics.revenue}` },
                        { label: '留言', value: adminStats.metrics.messages },
                        { label: '用户', value: adminStats.metrics.users },
                        { label: '素材', value: adminStats.metrics.assets },
                        { label: '日志', value: adminStats.metrics.logs },
                    ].map((item) => (
                        <div key={item.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                            <div className="text-sm text-gray-500 mb-2">{item.label}</div>
                            <div className="text-2xl font-black text-[var(--accent)]">{item.value}</div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 mb-8 border-b border-[var(--border)] overflow-x-auto">
                    {[
                        ['overview', '概览'],
                        ['products', '商品管理'],
                        ['orders', '订单中心'],
                        ['users', '用户权限'],
                        ['operations', '运营配置'],
                        ['assets', '素材中心'],
                        ['messages', '联系留言'],
                    ].map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-mono text-sm whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-gray-500'}`}>{label}</button>
                    ))}
                </div>

                {message && <div className="mb-6 text-sm text-[var(--accent)]">{message}</div>}

                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
                        <div className="space-y-8">
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <h3 className="text-2xl font-bold mb-6">最近订单</h3>
                                <div className="space-y-4">
                                    {adminStats.recentOrders.map((order) => (
                                        <div key={order.id} className="border border-[var(--border)] rounded-2xl p-5 flex flex-wrap justify-between gap-4">
                                            <div>
                                                <div className="font-bold">{order.customerInfo.fullName}</div>
                                                <div className="text-sm text-gray-500">{order.id} · {order.status}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[var(--accent)] font-bold">¥{order.finalTotal || order.total}</div>
                                                <div className="text-xs text-gray-500">{new Date(order.date).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <h3 className="text-2xl font-bold mb-6">操作日志</h3>
                                <div className="space-y-4">
                                    {latestLogs.map((log) => (
                                        <div key={log.id} className="border border-[var(--border)] rounded-2xl p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                <div className="font-bold">{log.summary}</div>
                                                <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                                            </div>
                                            <div className="text-sm text-gray-400">{log.actorName} · {log.action}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <h3 className="text-2xl font-bold mb-6">低库存提醒</h3>
                                <div className="space-y-4">
                                    {lowStockProducts.map((product) => (
                                        <div key={product.id} className="border border-[var(--border)] rounded-2xl p-4">
                                            <div className="font-bold">{product.name}</div>
                                            <div className="text-sm text-gray-500">库存 {product.stock}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <h3 className="text-2xl font-bold mb-6">素材统计</h3>
                                <div className="space-y-4">
                                    {assets.slice(0, 4).map((asset) => (
                                        <div key={asset.id} className="border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="font-bold truncate">{asset.fileName}</div>
                                                <div className="text-xs text-gray-500">{asset.provider} · {asset.bucket}</div>
                                            </div>
                                            <a href={asset.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] text-sm">查看</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">商品列表</h3>
                                <button onClick={() => setProductForm(emptyProductForm)} className="btn-outline px-4 py-2 rounded-full text-sm">新增商品</button>
                            </div>
                            <div className="space-y-4 max-h-[700px] overflow-auto pr-2">
                                {products.map((product) => (
                                    <div key={product.id} className="border border-[var(--border)] rounded-2xl p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                        <div className="flex gap-4 items-center min-w-0">
                                            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-2xl object-cover" />
                                            <div className="min-w-0">
                                                <div className="font-bold truncate">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.brand} · {product.category}</div>
                                                <div className="text-sm text-[var(--accent)]">¥{product.price} · 库存 {product.stock}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleEditProduct(product)} className="px-4 py-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] text-sm">编辑</button>
                                            <button onClick={() => deleteProduct(product.id)} className="px-4 py-2 rounded-full border border-red-500/40 text-red-400 text-sm">删除</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h3 className="text-2xl font-bold mb-6">{productForm.id ? '编辑商品' : '新增商品'}</h3>
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <input name="name" value={productForm.name} onChange={handleProductChange} placeholder="商品名称" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <select name="category" value={productForm.category} onChange={handleProductChange} className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3">
                                        {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </select>
                                    <input name="brand" value={productForm.brand} onChange={handleProductChange} placeholder="品牌" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="price" value={productForm.price} onChange={handleProductChange} type="number" min="0" placeholder="价格" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" required />
                                    <input name="stock" value={productForm.stock} onChange={handleProductChange} type="number" min="0" placeholder="库存" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" required />
                                </div>
                                <input name="image" value={productForm.image} onChange={handleProductChange} placeholder="图片地址" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" required />
                                <textarea name="description" value={productForm.description} onChange={handleProductChange} placeholder="商品描述" rows="4" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" required />
                                <input name="badge" value={productForm.badge} onChange={handleProductChange} placeholder="角标，如：新品 / 热卖" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                                <input name="tags" value={productForm.tags} onChange={handleProductChange} placeholder="标签，使用逗号分隔" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                                <input name="specs" value={productForm.specs} onChange={handleProductChange} placeholder="规格，使用逗号分隔" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                                    <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={productForm.featured} onChange={handleProductChange} />精选</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="trending" checked={productForm.trending} onChange={handleProductChange} />趋势</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="newArrival" checked={productForm.newArrival} onChange={handleProductChange} />新品</label>
                                </div>
                                <button type="submit" className="w-full btn-primary py-3 rounded-2xl">保存商品</button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 space-y-5">
                            <h3 className="text-2xl font-bold">订单状态维护</h3>
                            {adminOrders.map((order) => (
                                <div key={order.id} className="border border-[var(--border)] rounded-2xl p-5">
                                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                                        <div>
                                            <div className="font-bold">订单 {order.id}</div>
                                            <div className="text-sm text-gray-500">{order.customerInfo.fullName} · {new Date(order.date).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[var(--accent)] font-bold">¥{order.finalTotal || order.total}</div>
                                            <div className="text-xs text-gray-500">运单号：{order.trackingNumber}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-400 mb-4">
                                        {order.items.map((item) => `${item.name} x ${item.quantity}`).join(' / ')}
                                    </div>
                                    <div className="grid xl:grid-cols-[320px_1fr] gap-4 items-start">
                                        <div className="space-y-4">
                                            <select
                                                value={orderForms[order.id]?.status || order.status}
                                                onChange={(event) => {
                                                    handleOrderFormChange(order.id, 'status', event.target.value);
                                                    handleOrderFormChange(order.id, 'eventStatus', event.target.value);
                                                }}
                                                className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3"
                                            >
                                                {(statusPipeline || adminStats.statusPipeline).map((status) => <option key={status} value={status}>{status}</option>)}
                                            </select>
                                            <input
                                                value={orderForms[order.id]?.trackingNumber || ''}
                                                onChange={(event) => handleOrderFormChange(order.id, 'trackingNumber', event.target.value)}
                                                placeholder="运单号"
                                                className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3"
                                            />
                                            <input
                                                value={orderForms[order.id]?.eventTitle || ''}
                                                onChange={(event) => handleOrderFormChange(order.id, 'eventTitle', event.target.value)}
                                                placeholder="新增物流节点标题"
                                                className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3"
                                            />
                                            <input
                                                value={orderForms[order.id]?.eventLocation || ''}
                                                onChange={(event) => handleOrderFormChange(order.id, 'eventLocation', event.target.value)}
                                                placeholder="节点位置"
                                                className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3"
                                            />
                                            <textarea
                                                value={orderForms[order.id]?.eventDetail || ''}
                                                onChange={(event) => handleOrderFormChange(order.id, 'eventDetail', event.target.value)}
                                                placeholder="节点说明"
                                                rows="3"
                                                className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3"
                                            />
                                            <div className="flex gap-3">
                                                <button onClick={() => handleSaveOrderFlow(order.id)} className="btn-primary px-5 py-3 rounded-xl text-sm">保存履约</button>
                                                <button onClick={() => updateOrderStatus(order.id, orderForms[order.id]?.status || order.status)} className="px-5 py-3 rounded-xl border border-[var(--border)] text-sm">仅更新状态</button>
                                            </div>
                                        </div>
                                        <div className="border border-[var(--border)] rounded-2xl p-4 bg-[var(--primary)]">
                                            <div className="font-bold mb-3">轨迹预览</div>
                                            <div className="space-y-3 text-sm text-gray-400">
                                                {(order.trackingEvents || []).slice().reverse().map((event) => (
                                                    <div key={`${order.id}-${event.time}-${event.status}`}>
                                                        <div className="text-white">{event.title}</div>
                                                        <div>{event.location} · {new Date(event.time).toLocaleString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h3 className="text-2xl font-bold mb-6">订单流程说明</h3>
                            <div className="space-y-4 text-sm text-gray-400">
                                <div className="border border-[var(--border)] rounded-2xl p-4">用户在前台下单时可应用优惠券，系统自动记录实付金额、优惠信息与初始物流节点。</div>
                                <div className="border border-[var(--border)] rounded-2xl p-4">管理员更新订单状态后，后端会同步追加物流轨迹，用户订单详情页可直接查看。</div>
                                <div className="border border-[var(--border)] rounded-2xl p-4">所有关键动作会写入操作日志，便于后台审计与后续扩展通知机制。</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 space-y-4">
                            <h3 className="text-2xl font-bold mb-4">用户列表</h3>
                            {adminUsers.map((item) => (
                                <button key={item.id} onClick={() => setSelectedUserId(item.id)} className={`w-full text-left border rounded-2xl p-4 transition-colors ${selectedUserId === item.id ? 'border-[var(--accent)] bg-[var(--primary)]' : 'border-[var(--border)]'}`}>
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.role}</div>
                                    </div>
                                    <div className="text-sm text-gray-400">{item.email}</div>
                                    <div className="text-xs text-gray-500 mt-2">订单 {item.orderCount} · 累计消费 ¥{item.totalSpent}</div>
                                </button>
                            ))}
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h3 className="text-2xl font-bold mb-6">权限与角色</h3>
                            {userForm ? (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" placeholder="姓名" />
                                        <input value={userForm.phone} onChange={(event) => setUserForm((current) => ({ ...current, phone: event.target.value }))} className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" placeholder="电话" />
                                        <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))} className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3">
                                            <option value="user">普通用户</option>
                                            <option value="admin">管理员</option>
                                        </select>
                                        <select value={userForm.permissionLevel} onChange={(event) => setUserForm((current) => ({ ...current, permissionLevel: event.target.value }))} className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3">
                                            <option value="member">member</option>
                                            <option value="support">support</option>
                                            <option value="ops">ops</option>
                                            <option value="super-admin">super-admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="font-bold mb-4">权限点</div>
                                        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
                                            {allPermissions.map((permission) => (
                                                <label key={permission} className="border border-[var(--border)] rounded-2xl px-4 py-3 flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={userForm.permissions.includes(permission)}
                                                        onChange={() => handleUserPermissionToggle(permission)}
                                                        disabled={userForm.role !== 'admin'}
                                                    />
                                                    {permission}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={handleSaveUser} className="btn-primary px-6 py-3 rounded-full">保存用户配置</button>
                                </div>
                            ) : (
                                <div className="text-gray-500">暂无可编辑用户。</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold">Banner 配置</h3>
                                    <button onClick={() => handleAddMarketingItem('banners')} className="btn-outline px-4 py-2 rounded-full text-sm">新增 Banner</button>
                                </div>
                                <div className="space-y-4">
                                    {marketingForm.banners.map((banner, index) => (
                                        <div key={banner.id} className="border border-[var(--border)] rounded-2xl p-4 space-y-3">
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <input value={banner.title} onChange={(event) => handleMarketingItemChange('banners', index, 'title', event.target.value)} placeholder="标题" className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                                <input value={banner.link} onChange={(event) => handleMarketingItemChange('banners', index, 'link', event.target.value)} placeholder="跳转链接" className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                                <input value={banner.image} onChange={(event) => handleMarketingItemChange('banners', index, 'image', event.target.value)} placeholder="图片地址" className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3 md:col-span-2" />
                                                <textarea value={banner.subtitle} onChange={(event) => handleMarketingItemChange('banners', index, 'subtitle', event.target.value)} placeholder="副标题" className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3 md:col-span-2" rows="3" />
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <label className="text-sm text-gray-400 flex items-center gap-2"><input type="checkbox" checked={banner.active} onChange={(event) => handleMarketingItemChange('banners', index, 'active', event.target.checked)} />启用</label>
                                                <button onClick={() => handleRemoveMarketingItem('banners', index)} className="text-red-400 text-sm">删除</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold">推荐位配置</h3>
                                    <button onClick={() => handleAddMarketingItem('recommendations')} className="btn-outline px-4 py-2 rounded-full text-sm">新增推荐位</button>
                                </div>
                                <div className="space-y-4">
                                    {marketingForm.recommendations.map((item, index) => (
                                        <div key={item.id} className="border border-[var(--border)] rounded-2xl p-4 space-y-3">
                                            <input value={item.title} onChange={(event) => handleMarketingItemChange('recommendations', index, 'title', event.target.value)} placeholder="推荐位标题" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                            <textarea value={item.description} onChange={(event) => handleMarketingItemChange('recommendations', index, 'description', event.target.value)} placeholder="推荐位说明" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" rows="3" />
                                            <input value={(item.productIds || []).join(', ')} onChange={(event) => handleRecommendationProductsChange(index, event.target.value)} placeholder="商品 ID，使用逗号分隔" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                            <div className="text-right">
                                                <button onClick={() => handleRemoveMarketingItem('recommendations', index)} className="text-red-400 text-sm">删除</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold">优惠券配置</h3>
                                    <button onClick={() => handleAddMarketingItem('coupons')} className="btn-outline px-4 py-2 rounded-full text-sm">新增优惠券</button>
                                </div>
                                <div className="space-y-4">
                                    {marketingForm.coupons.map((coupon, index) => (
                                        <div key={coupon.id} className="border border-[var(--border)] rounded-2xl p-4 space-y-3">
                                            <input value={coupon.code} onChange={(event) => handleMarketingItemChange('coupons', index, 'code', event.target.value)} placeholder="优惠码" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                            <textarea value={coupon.description} onChange={(event) => handleMarketingItemChange('coupons', index, 'description', event.target.value)} placeholder="优惠说明" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" rows="3" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <select value={coupon.discountType} onChange={(event) => handleMarketingItemChange('coupons', index, 'discountType', event.target.value)} className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3">
                                                    <option value="amount">金额</option>
                                                    <option value="percent">折扣</option>
                                                </select>
                                                <input value={coupon.value} type="number" onChange={(event) => handleMarketingItemChange('coupons', index, 'value', Number(event.target.value))} placeholder="优惠值" className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                                <input value={coupon.minAmount} type="number" onChange={(event) => handleMarketingItemChange('coupons', index, 'minAmount', Number(event.target.value))} placeholder="门槛金额" className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3" />
                                                <select value={coupon.status} onChange={(event) => handleMarketingItemChange('coupons', index, 'status', event.target.value)} className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3">
                                                    <option value="active">active</option>
                                                    <option value="inactive">inactive</option>
                                                </select>
                                            </div>
                                            <div className="text-right">
                                                <button onClick={() => handleRemoveMarketingItem('coupons', index)} className="text-red-400 text-sm">删除</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSaveMarketing} className="w-full btn-primary py-4 rounded-2xl">保存运营配置</button>
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 space-y-5">
                            <h3 className="text-2xl font-bold">上传素材</h3>
                            <input value={uploadForm.fileName} onChange={(event) => setUploadForm((current) => ({ ...current, fileName: event.target.value }))} placeholder="素材名称" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input value={uploadForm.remoteUrl} onChange={(event) => setUploadForm((current) => ({ ...current, remoteUrl: event.target.value, dataUrl: '' }))} placeholder="远程图片 URL（可选）" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            {uploadMessage && <div className="text-sm text-[var(--accent)]">{uploadMessage}</div>}
                            <button onClick={handleUploadAsset} className="w-full btn-primary py-4 rounded-2xl">上传到素材库</button>
                            <div className="text-sm text-gray-500 leading-relaxed">支持本地图片转 Base64 上传，也支持直接登记远程素材链接，接口会统一返回可访问地址。</div>
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h3 className="text-2xl font-bold mb-6">素材列表</h3>
                            <div className="grid md:grid-cols-2 gap-4 max-h-[760px] overflow-auto pr-2">
                                {assets.map((asset) => (
                                    <div key={asset.id} className="border border-[var(--border)] rounded-2xl overflow-hidden">
                                        <div className="aspect-video bg-[var(--primary)]">
                                            <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="font-bold truncate">{asset.fileName}</div>
                                            <div className="text-xs text-gray-500">{asset.provider} · {asset.bucket}</div>
                                            <div className="text-xs text-gray-500">{asset.mimeType} · {asset.size} bytes</div>
                                            <div className="flex items-center justify-between gap-3">
                                                <a href={asset.url} target="_blank" rel="noreferrer" className="text-sm text-[var(--accent)]">打开素材</a>
                                                <button onClick={() => handleDeleteAsset(asset.id)} className="text-sm text-red-400">删除</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 space-y-5">
                            <h3 className="text-2xl font-bold">联系留言</h3>
                            {contactMessages.length === 0 ? (
                                <div className="text-gray-500">暂无留言。</div>
                            ) : (
                                contactMessages.map((item) => (
                                    <div key={item.id} className="border border-[var(--border)] rounded-2xl p-5">
                                        <div className="flex flex-wrap justify-between gap-4 mb-3">
                                            <div>
                                                <div className="font-bold">{item.subject}</div>
                                                <div className="text-sm text-gray-500">{item.name} · {item.email}</div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className="text-sm text-[var(--accent)]">{new Date(item.createdAt).toLocaleString()}</div>
                                                <select value={item.status || 'new'} onChange={(event) => handleMessageStatusChange(item.id, event.target.value)} className="bg-[var(--primary)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm">
                                                    {messageStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed">{item.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 space-y-5">
                            <h3 className="text-2xl font-bold">完整流程说明</h3>
                            <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                                <div className="border border-[var(--border)] rounded-2xl p-5">前台首页已接入 Banner、优惠券和推荐位内容，后台保存后首页立即读取新配置。</div>
                                <div className="border border-[var(--border)] rounded-2xl p-5">用户下单后，订单详情页可查看优惠明细、收货信息、运单号与物流轨迹。</div>
                                <div className="border border-[var(--border)] rounded-2xl p-5">管理员在后台更新订单状态、修改用户权限、上传素材时，后端会记录操作日志。</div>
                                <div className="border border-[var(--border)] rounded-2xl p-5">即使未配置 MongoDB，也能通过演示模式体验上述完整流程，适配当前项目本地开发场景。</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
