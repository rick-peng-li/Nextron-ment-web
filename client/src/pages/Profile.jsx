import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const statusColorMap = {
    Processing: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    Packed: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    Shipped: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    Delivered: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Completed: 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10',
};

const Profile = () => {
    const { user, profile, orders, wishlist, cart, logout, updateProfile } = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [form, setForm] = useState(profile);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setForm(profile);
    }, [profile]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [navigate, user]);

    const initials = useMemo(() => (user?.name || 'User').split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase(), [user?.name]);
    const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + Number(order.finalTotal || order.total || 0), 0), [orders]);
    const latestOrder = orders[0] || null;

    if (!user) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (name === 'newsletter') {
            setForm((current) => ({
                ...current,
                preferences: {
                    ...current.preferences,
                    newsletter: checked,
                },
            }));
            return;
        }

        if (name.startsWith('address.')) {
            const key = name.replace('address.', '');
            setForm((current) => ({
                ...current,
                address: {
                    ...current.address,
                    [key]: value,
                },
            }));
            return;
        }

        setForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        try {
            await updateProfile(form);
            setMessage('资料已更新');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const tabs = [
        { id: 'overview', label: '概览' },
        { id: 'profile', label: '资料' },
        { id: 'orders', label: '订单' },
        { id: 'wishlist', label: '心愿单' },
    ];

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden mb-8 border border-[var(--border)] bg-[var(--surface)]">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-1/3 w-96 h-40 bg-[var(--accent)] rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 right-1/4 w-72 h-32 bg-[var(--accent-2)] rounded-full blur-[80px]" />
                    </div>
                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-[var(--accent)]/30">
                            {initials}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <p className="font-mono text-xs text-gray-500 mb-1 uppercase tracking-widest">{user.role === 'admin' ? '管理员账户' : '会员账户'} · {user.permissionLevel || 'member'}</p>
                            <h1 className="text-4xl md:text-5xl font-black mb-2">{user.name}</h1>
                            <p className="text-gray-400 font-mono text-sm">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                                <div><p className="text-3xl font-black text-[var(--accent)]">{orders.length}</p><p className="text-xs font-mono text-gray-500 mt-1">订单</p></div>
                                <div><p className="text-3xl font-black text-[var(--accent)]">{wishlist.length}</p><p className="text-xs font-mono text-gray-500 mt-1">收藏</p></div>
                                <div><p className="text-3xl font-black text-[var(--accent)]">¥{totalSpent}</p><p className="text-xs font-mono text-gray-500 mt-1">累计消费</p></div>
                            </div>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-xs px-5 py-2 rounded-full transition-all duration-200">
                            退出登录
                        </button>
                    </div>
                </div>

                <div className="flex gap-1 mb-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-1 w-fit overflow-x-auto">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`font-mono text-xs px-6 py-2.5 rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-[var(--accent)] text-[var(--primary)] font-bold' : 'text-gray-400 hover:text-white'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: '账户身份', value: user.role === 'admin' ? '管理员' : '普通会员' },
                            { title: '联系电话', value: profile.phone || '未填写' },
                            { title: '最近订单', value: latestOrder ? latestOrder.id : '暂无订单' },
                        ].map((item) => (
                            <div key={item.title} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                <h3 className="font-mono text-xs text-gray-500 mb-4">{item.title}</h3>
                                <p className="text-xl font-bold break-words">{item.value}</p>
                            </div>
                        ))}
                        <div className="md:col-span-3 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">订单与物流闭环</h2>
                                    <p className="text-gray-400 text-sm mt-2">下单后可在此查看订单状态、优惠信息、收货地址与物流轨迹。</p>
                                </div>
                                {latestOrder && (
                                    <Link to={`/profile/orders/${latestOrder.id}`} className="btn-primary px-5 py-3 rounded-full text-sm">
                                        查看最近订单
                                    </Link>
                                )}
                            </div>
                            {latestOrder ? (
                                <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center border border-[var(--border)] rounded-2xl p-5">
                                    <div>
                                        <div className="font-bold mb-2">订单号：{latestOrder.id}</div>
                                        <div className="text-sm text-gray-500 mb-2">{new Date(latestOrder.date).toLocaleString()}</div>
                                        <div className="text-sm text-gray-400">{latestOrder.items.map((item) => `${item.name} × ${item.quantity}`).join(' / ')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex px-3 py-1 rounded-full border text-xs font-mono mb-3 ${statusColorMap[latestOrder.status] || statusColorMap.Processing}`}>{latestOrder.status}</div>
                                        <div className="text-2xl font-black text-[var(--accent)]">¥{latestOrder.finalTotal || latestOrder.total}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">还没有订单，先去商品中心体验完整下单流程。</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-6">维护资料</h2>
                        <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                            <input name="name" value={form.name || ''} onChange={handleChange} placeholder="姓名" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="联系电话" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input name="address.line1" value={form.address?.line1 || ''} onChange={handleChange} placeholder="详细地址" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3 md:col-span-2" />
                            <input name="address.city" value={form.address?.city || ''} onChange={handleChange} placeholder="城市" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input name="address.state" value={form.address?.state || ''} onChange={handleChange} placeholder="省份/州" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input name="address.zipCode" value={form.address?.zipCode || ''} onChange={handleChange} placeholder="邮编" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <input name="address.country" value={form.address?.country || ''} onChange={handleChange} placeholder="国家/地区" className="bg-[var(--primary)] border border-[var(--border)] rounded-2xl px-4 py-3" />
                            <label className="md:col-span-2 flex items-center gap-3 text-gray-400">
                                <input type="checkbox" name="newsletter" checked={Boolean(form.preferences?.newsletter)} onChange={handleChange} />
                                订阅新品与活动通知
                            </label>
                            {message && <div className="md:col-span-2 text-[var(--accent)] text-sm">{message}</div>}
                            <button type="submit" className="md:col-span-2 btn-primary py-4 rounded-2xl font-bold">保存资料</button>
                        </form>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                        <h2 className="font-mono text-xs text-gray-500 mb-6 tracking-widest">订单记录</h2>
                        {orders.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">暂无订单记录。</div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-[var(--border)] rounded-2xl p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                            <div>
                                                <p className="font-mono text-xs text-gray-500 mb-1">订单号</p>
                                                <p className="font-bold text-sm">{order.id}</p>
                                            </div>
                                            <div>
                                                <p className="font-mono text-xs text-gray-500 mb-1">日期</p>
                                                <p className="font-bold text-sm">{new Date(order.date).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="font-mono text-xs text-gray-500 mb-1">实付金额</p>
                                                <p className="font-bold text-sm text-[var(--accent)]">¥{order.finalTotal || order.total}</p>
                                            </div>
                                            <span className={`font-mono text-xs px-3 py-1 rounded-full border ${statusColorMap[order.status] || statusColorMap.Processing}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-400 mb-5">
                                            {order.items.map((item) => (
                                                <div key={`${order.id}-${item.id}`} className="flex items-center justify-between">
                                                    <span>{item.name} × {item.quantity}</span>
                                                    <span>¥{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                                            <div className="text-sm text-gray-500">运单号：{order.trackingNumber || '待生成'}</div>
                                            <Link to={`/profile/orders/${order.id}`} className="btn-outline px-5 py-2.5 rounded-full text-sm">
                                                查看详情与物流
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                        <h2 className="font-mono text-xs text-gray-500 mb-6 tracking-widest">心愿单</h2>
                        {wishlist.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">你的心愿单为空。</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wishlist.map((item) => (
                                    <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer hover:border-[var(--accent)] transition-colors">
                                        <div className="aspect-square overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4">
                                            <p className="font-bold truncate">{item.name}</p>
                                            <p className="text-[var(--accent)] font-mono font-bold mt-1">¥{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
