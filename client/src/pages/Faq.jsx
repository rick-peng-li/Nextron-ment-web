import React from 'react';
import { useStore } from '../context/StoreContext';

const Faq = () => {
    const { homeContent } = useStore();

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black mb-4">
                        常见 <span className="text-[var(--accent)]">问题</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-3xl">
                        用于承接售前说明、部署问答和项目演示指引，目前内容来自统一站点内容接口。
                    </p>
                </div>

                <div className="space-y-6">
                    {homeContent.faqs.map((item) => (
                        <div key={item.question} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h3 className="text-2xl font-bold mb-4">{item.question}</h3>
                            <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Faq;
