import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';

const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    shipping: 'Standard Shipping',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    couponCode: '',
};

const CheckoutModal = () => {
    const {
        isCheckoutOpen,
        setIsCheckoutOpen,
        placeOrder,
        setIsCartOpen,
        cart,
        cartTotal,
        activeCoupons,
        validateCoupon,
    } = useStore();
    const [step, setStep] = useState(1);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [couponState, setCouponState] = useState({ loading: false, message: '', appliedCoupon: null, finalTotal: 0 });
    const [formData, setFormData] = useState(initialForm);

    const payableTotal = couponState.appliedCoupon ? couponState.finalTotal : cartTotal;

    const resetModal = () => {
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setOrderComplete(false);
        setStep(1);
        setOrderResult(null);
        setCouponState({ loading: false, message: '', appliedCoupon: null, finalTotal: 0 });
        setFormData(initialForm);
    };

    const recommendedCoupons = useMemo(() => activeCoupons.slice(0, 2), [activeCoupons]);

    if (!isCheckoutOpen) return null;

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleApplyCoupon = async () => {
        if (!formData.couponCode.trim()) {
            setCouponState({ loading: false, message: '请输入优惠码', appliedCoupon: null, finalTotal: cartTotal });
            return;
        }

        try {
            setCouponState((current) => ({ ...current, loading: true, message: '' }));
            const result = await validateCoupon(formData.couponCode.trim(), cartTotal);
            setCouponState({
                loading: false,
                message: `${result.message}，已优惠 ¥${result.discount}`,
                appliedCoupon: { ...result.coupon, discount: result.discount },
                finalTotal: result.finalTotal,
            });
        } catch (error) {
            setCouponState({ loading: false, message: error.message, appliedCoupon: null, finalTotal: cartTotal });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (step < 3) {
            setStep((current) => current + 1);
            return;
        }

        const order = await placeOrder({
            ...formData,
            appliedCoupon: couponState.appliedCoupon,
            couponCode: couponState.appliedCoupon?.code || formData.couponCode,
        });
        setOrderResult(order);
        setOrderComplete(true);
        setTimeout(() => {
            resetModal();
        }, 3000);
    };

    if (orderComplete) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <div className="modal-backdrop absolute inset-0"></div>
                <div className="relative bg-[var(--primary)] border-2 border-[var(--accent)] rounded-3xl p-12 max-w-md text-center">
                    <svg className="w-24 h-24 mx-auto mb-6" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="4" />
                        <path className="checkmark" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" d="M30 50 L45 65 L70 35" />
                    </svg>
                    <h2 className="text-3xl font-black mb-4">订单提交成功</h2>
                    <p className="text-gray-400 mb-2">你的订单已经创建，可在个人中心查看物流进度。</p>
                    <p className="text-sm text-gray-500 mb-1">订单号：{orderResult?.id}</p>
                    <p className="text-sm text-[var(--accent)]">实付金额：¥{orderResult?.finalTotal || orderResult?.total || payableTotal}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 modal-backdrop z-[60]" onClick={resetModal}></div>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="relative bg-[var(--primary)] border border-[var(--border)] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black">CHECKOUT</h2>
                        <button onClick={resetModal} className="w-10 h-10 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                {[1, 2, 3].map((num) => (
                                    <React.Fragment key={num}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= num ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}>{num}</div>
                                        {num < 3 && <div className={`flex-1 h-1 mx-2 ${step > num ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit}>
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold mb-4">收货信息</h3>
                                        <input type="text" name="fullName" placeholder="姓名" value={formData.fullName} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input type="email" name="email" placeholder="邮箱" value={formData.email} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                            <input type="tel" name="phone" placeholder="手机号" value={formData.phone} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        </div>
                                        <input type="text" name="address" placeholder="详细地址" value={formData.address} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input type="text" name="city" placeholder="城市" value={formData.city} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                            <input type="text" name="state" placeholder="省份 / 州" value={formData.state} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input type="text" name="zipCode" placeholder="邮编" value={formData.zipCode} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                            <input type="text" name="country" placeholder="国家 / 地区" value={formData.country} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold mb-4">配送与优惠</h3>
                                        <label className="flex items-center justify-between p-4 bg-[var(--surface)] border-2 border-[var(--accent)] rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <input type="radio" name="shipping" value="Standard Shipping" checked={formData.shipping === 'Standard Shipping'} onChange={handleInputChange} className="w-5 h-5" />
                                                <div>
                                                    <div className="font-bold">标准配送</div>
                                                    <div className="text-sm text-gray-500">48 小时内发出，支持订单轨迹查询</div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-[var(--accent)]">FREE</div>
                                        </label>
                                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
                                            <div className="flex flex-wrap gap-3">
                                                {recommendedCoupons.map((coupon) => (
                                                    <button
                                                        key={coupon.id}
                                                        type="button"
                                                        onClick={() => setFormData((current) => ({ ...current, couponCode: coupon.code }))}
                                                        className="px-3 py-2 rounded-full border border-[var(--border)] text-xs text-gray-300 hover:border-[var(--accent)]"
                                                    >
                                                        {coupon.code}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    name="couponCode"
                                                    placeholder="输入优惠码"
                                                    value={formData.couponCode}
                                                    onChange={handleInputChange}
                                                    className="flex-1 bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3"
                                                />
                                                <button type="button" onClick={handleApplyCoupon} className="btn-outline px-5 py-3 rounded-xl text-sm" disabled={couponState.loading}>
                                                    {couponState.loading ? '校验中...' : '应用'}
                                                </button>
                                            </div>
                                            {couponState.message && <div className={`text-sm ${couponState.appliedCoupon ? 'text-[var(--accent)]' : 'text-red-400'}`}>{couponState.message}</div>}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold mb-4">支付信息</h3>
                                        <input type="text" name="cardNumber" placeholder="卡号" value={formData.cardNumber} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        <input type="text" name="cardName" placeholder="持卡人姓名" value={formData.cardName} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input type="text" name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                            <input type="text" name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleInputChange} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3" required />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-8">
                                    {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} className="flex-1 btn-outline py-4 rounded-full font-mono text-sm">返回</button>}
                                    <button type="submit" className="flex-1 btn-primary py-4 rounded-full font-mono text-sm" disabled={cart.length === 0}>{step === 3 ? '提交订单' : '继续'}</button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 h-fit sticky top-6">
                            <h3 className="text-xl font-bold mb-5">订单摘要</h3>
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{item.name}</div>
                                            <div className="text-gray-500">x {item.quantity}</div>
                                        </div>
                                        <div className="text-[var(--accent)]">¥{Number(item.price) * Number(item.quantity)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 text-sm border-t border-[var(--border)] pt-4">
                                <div className="flex justify-between text-gray-400"><span>商品金额</span><span>¥{cartTotal}</span></div>
                                <div className="flex justify-between text-gray-400"><span>配送费</span><span>¥0</span></div>
                                <div className="flex justify-between text-gray-400"><span>优惠金额</span><span>-¥{couponState.appliedCoupon?.discount || 0}</span></div>
                                <div className="flex justify-between font-bold text-lg text-[var(--accent)]"><span>实付金额</span><span>¥{payableTotal}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutModal;
