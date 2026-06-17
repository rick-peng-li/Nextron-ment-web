import React from 'react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Trending = () => {
    const { trendingProducts, isInitializing } = useStore();

    return (
        <div className="pt-32 min-h-screen px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between gap-6 items-start mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            趋势 <span className="text-[var(--accent)]">精选</span>
                        </h1>
                        <p className="text-gray-400 font-mono text-sm max-w-2xl leading-relaxed">
                            该专题使用后端 trending 字段驱动，可作为活动专区、首页副频道或算法推荐位的基础能力。
                        </p>
                    </div>
                    <div className="border border-[var(--border)] rounded-2xl px-5 py-4 text-sm text-gray-400">
                        当前共 {trendingProducts.length} 个趋势商品
                    </div>
                </div>

                {isInitializing ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trendingProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trending;
