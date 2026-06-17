import React, { useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const MysteryDrop = () => {
    const { newArrivalProducts } = useStore();

    const nextDropDate = useMemo(() => {
        const target = new Date();
        target.setDate(target.getDate() + 7);
        return target.toLocaleDateString('zh-CN');
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-2)_0%,_transparent_40%)] opacity-10 blur-3xl"></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-[var(--accent)] text-[var(--accent)] text-xs font-mono mb-8">
                        新品首发频道
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        NEW <span className="text-[var(--accent)]">ARRIVALS</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                        这里用于承接新品、预售和限量活动。当前页面已经接入 newArrival 数据，可继续拓展为倒计时营销页或预约页。
                    </p>
                    <div className="inline-flex border border-[var(--border)] rounded-full px-6 py-3 text-sm text-gray-400 bg-[var(--surface)]">
                        下一期新品窗口：{nextDropDate}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {newArrivalProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {[
                        '支持新品标签、时间排序与首页推荐联动。',
                        '可继续新增库存预警、预约提醒和营销 Banner 配置。',
                        '与后台商品管理联动后，运营人员可以直接控制首发频道内容。',
                    ].map((item) => (
                        <div key={item} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 text-gray-400 leading-relaxed">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MysteryDrop;
