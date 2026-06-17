import React from 'react';
import { useStore } from '../context/StoreContext';

const Warranty = () => {
    const { homeContent } = useStore();

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black mb-4">
                        保修 <span className="text-[var(--accent)]">政策</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-3xl">
                        该页面适合作为售后政策说明页，也可以继续扩展维修进度查询、延保购买等业务能力。
                    </p>
                </div>

                <div className="space-y-6">
                    {homeContent.warranty.map((item) => (
                        <div key={item} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 text-gray-400 leading-relaxed">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Warranty;
