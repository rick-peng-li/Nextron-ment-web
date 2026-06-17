import React from 'react';
import { useStore } from '../context/StoreContext';

const Shipping = () => {
    const { homeContent } = useStore();

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black mb-4">
                        物流与 <span className="text-[var(--accent)]">退换</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-3xl">
                        展示配送、履约与售后规则，方便与订单状态流转和客服支持模块配合使用。
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {homeContent.shipping.map((item) => (
                        <div key={item} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 text-gray-400 leading-relaxed">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Shipping;
