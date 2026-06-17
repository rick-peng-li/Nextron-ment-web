import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Products = () => {
    const { products, categories } = useStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');

    useEffect(() => {
        setCategory(searchParams.get('category') || 'all');
        setSearch(searchParams.get('search') || '');
        setSortBy(searchParams.get('sort') || 'featured');
    }, [searchParams]);

    const updateQuery = (nextValues) => {
        const params = {
            category,
            search,
            sort: sortBy,
            ...nextValues,
        };

        const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value && value !== 'all' && value !== 'featured'));
        setSearchParams(cleaned);
    };

    const filteredProducts = useMemo(() => {
        return [...products]
            .filter((product) => category === 'all' || product.category === category)
            .filter((product) => {
                if (!search.trim()) return true;
                const keyword = search.toLowerCase();
                return [product.name, product.description, product.brand, product.badge, ...(product.tags || [])]
                    .join(' ')
                    .toLowerCase()
                    .includes(keyword);
            })
            .sort((left, right) => {
                if (sortBy === 'price-low') return left.price - right.price;
                if (sortBy === 'price-high') return right.price - left.price;
                if (sortBy === 'rating') return (right.rating || 0) - (left.rating || 0);
                if (sortBy === 'latest') return Number(Boolean(right.newArrival)) - Number(Boolean(left.newArrival));
                return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
            });
    }, [category, products, search, sortBy]);

    const categoryName = category === 'all' ? '全部商品' : categories.find((item) => item.id === category)?.name || category;

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-5xl md:text-6xl font-black mb-4">
                        {categoryName} <span className="text-[var(--accent)]">目录</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl">
                        当前页面用于承接商品中心场景，支持搜索、分类、排序和专题推荐，可继续扩展为分页或后端筛选。
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-4 mb-12">
                    <div className="lg:col-span-2">
                        <label className="block font-mono text-xs text-gray-500 mb-2">搜索关键词</label>
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                updateQuery({ search: event.target.value });
                            }}
                            placeholder="输入商品名、品牌、标签"
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors text-[var(--text)]"
                        />
                    </div>
                    <div>
                        <label className="block font-mono text-xs text-gray-500 mb-2">分类</label>
                        <select
                            value={category}
                            onChange={(event) => {
                                setCategory(event.target.value);
                                updateQuery({ category: event.target.value });
                            }}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors text-[var(--text)]"
                        >
                            <option value="all">全部分类</option>
                            {categories.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-mono text-xs text-gray-500 mb-2">排序</label>
                        <select
                            value={sortBy}
                            onChange={(event) => {
                                setSortBy(event.target.value);
                                updateQuery({ sort: event.target.value });
                            }}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors text-[var(--text)]"
                        >
                            <option value="featured">精选优先</option>
                            <option value="latest">新品优先</option>
                            <option value="rating">评分优先</option>
                            <option value="price-low">价格从低到高</option>
                            <option value="price-high">价格从高到低</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-mono">
                        当前筛选条件下暂无商品，可尝试清空搜索词或切换分类。
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
