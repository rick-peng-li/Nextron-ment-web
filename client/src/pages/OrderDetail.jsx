import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const statusColorMap = {
    Processing: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    Packed: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    Shipped: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    Delivered: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Completed: 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10',
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, fetchOrderDetail } = useStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const loadOrder = async () => {
            try {
                setLoading(true);
                const result = await fetchOrderDetail(id);
                if (!result) {
                    setError('订单不存在或已失效');
                    return;
                }
                setOrder(result);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [fetchOrderDetail, id, navigate, user]);

    const orderAmount = useMemo(() => Number(order?.finalTotal || order?.total || 0), [order]);
    const couponDiscount = useMemo(() => Number(order?.appliedCoupon?.discount || 0), [order]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="min-h-screen px-6 py-32">
                <div className="max-w-5xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center text-gray-400">
                    正在加载订单详情...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen px-6 py-32">
                <div className="max-w-5xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center">
                    <h2 className="text-3xl font-black mb-4">未找到订单</h2>
                    <p className="text-gray-400 mb-8">{error || '当前订单不存在。'}</p>
                    <Link to="/profile" className="btn-primary px-6 py-3 rounded-full inline-flex">返回个人中心</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link to="/profile" className="text-sm text-gray-500 hover:text-[var(--accent)] transition-colors">← 返回个人中心</Link>
                        <h1 className="text-4xl font-black mt-3">订单详情</h1>
                        <p className="text-gray-400 mt-2">订单号：{order.id} · 下单时间：{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-sm font-mono ${statusColorMap[order.status] || statusColorMap.Processing}`}>
                        {order.status}
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
                    <div className="space-y-8">
                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">物流轨迹</h2>
                                    <p className="text-gray-400 text-sm">运单号：{order.trackingNumber || '系统处理中，待生成'}</p>
                                </div>
                                <div className="text-sm text-gray-500">配送方式：{order.shippingMethod}</div>
                            </div>
                            <div className="space-y-6">
                                {(order.trackingEvents || []).map((event, index) => (
                                    <div key={`${event.status}-${event.time}-${index}`} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]/60'}`}></div>
                                            {index !== (order.trackingEvents || []).length - 1 && <div className="w-px flex-1 bg-[var(--border)] mt-2"></div>}
                                        </div>
                                        <div className="pb-6">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h3 className="font-bold">{event.title}</h3>
                                                <span className="text-xs font-mono text-[var(--accent)]">{event.status}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-2">{event.detail}</p>
                                            <div className="text-xs text-gray-500">{event.location} · {new Date(event.time).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h2 className="text-2xl font-bold mb-6">商品清单</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={`${order.id}-${item.id}`} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[var(--border)] rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover bg-[var(--primary)]" />
                                            <div>
                                                <div className="font-bold text-lg">{item.name}</div>
                                                <div className="text-sm text-gray-500">数量：{item.quantity}</div>
                                                <div className="text-sm text-gray-500">单价：¥{item.price}</div>
                                            </div>
                                        </div>
                                        <div className="text-xl font-black text-[var(--accent)]">¥{Number(item.price) * Number(item.quantity)}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h2 className="text-2xl font-bold mb-6">订单摘要</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-400"><span>商品金额</span><span>¥{order.total}</span></div>
                                <div className="flex justify-between text-gray-400"><span>优惠金额</span><span>-¥{couponDiscount}</span></div>
                                <div className="flex justify-between text-gray-400"><span>支付方式</span><span>{order.paymentMethod}</span></div>
                                <div className="flex justify-between text-gray-400"><span>配送方式</span><span>{order.shippingMethod}</span></div>
                                <div className="flex justify-between pt-3 mt-3 border-t border-[var(--border)] text-lg font-black text-[var(--accent)]"><span>实付金额</span><span>¥{orderAmount}</span></div>
                            </div>
                            {order.appliedCoupon?.code && (
                                <div className="mt-5 border border-[var(--accent)]/20 bg-[var(--accent)]/5 rounded-2xl p-4">
                                    <div className="font-bold mb-1">已使用优惠码：{order.appliedCoupon.code}</div>
                                    <div className="text-sm text-gray-400">{order.appliedCoupon.description}</div>
                                </div>
                            )}
                        </section>

                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h2 className="text-2xl font-bold mb-6">收货信息</h2>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div><span className="text-gray-500">收货人：</span>{order.customerInfo.fullName}</div>
                                <div><span className="text-gray-500">邮箱：</span>{order.customerInfo.email}</div>
                                <div><span className="text-gray-500">电话：</span>{order.customerInfo.phone}</div>
                                <div className="leading-relaxed">
                                    <span className="text-gray-500">地址：</span>
                                    {[
                                        order.customerInfo.address,
                                        order.customerInfo.city,
                                        order.customerInfo.state,
                                        order.customerInfo.zipCode,
                                        order.customerInfo.country,
                                    ].filter(Boolean).join(' ')}
                                </div>
                            </div>
                        </section>

                        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h2 className="text-2xl font-bold mb-4">服务提示</h2>
                            <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                                <p>订单状态会随着后台履约操作自动推进，当前项目已完成用户下单、后台更新状态、前台查看轨迹的完整闭环。</p>
                                <p>如需继续扩展，可在现有接口基础上增加真实快递单号同步、短信通知与售后申请流程。</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
