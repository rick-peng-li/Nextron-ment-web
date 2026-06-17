import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import Marquee from '../components/Marquee';
import { useStore } from '../context/StoreContext';

const Home = () => {
    const {
        categories,
        products,
        featuredProducts,
        trendingProducts,
        newArrivalProducts,
        recommendationSections,
        activeCoupons,
        homeContent,
    } = useStore();
    const [filter, setFilter] = useState('all');

    const filteredProducts = products.filter((product) => filter === 'all' || product.category === filter).slice(0, 8);
    const activeBanners = (homeContent.marketing?.banners || []).filter((banner) => banner.active);

    return (
        <div>
            <Hero />

            <div className="px-6 py-20" id="shop">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black mb-4">
                            按 <span className="text-[var(--accent)]">分类</span> 浏览
                        </h2>
                        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                            首页内容、分类卡片、精选商品、新品专题与运营配置都来自统一状态层，便于前后端继续扩展。
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 py-20 bg-[var(--surface)]" id="featured-products">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4">
                                精选 <span className="text-[var(--accent)]">商品</span>
                            </h2>
                            <p className="text-gray-400">用于展示推荐位与首屏转化商品。</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                            {homeContent.stats.map((item) => (
                                <div key={item.label} className="border border-[var(--border)] rounded-2xl px-5 py-4 text-center min-w-[120px]">
                                    <div className="text-2xl font-black text-[var(--accent)]">{item.value}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4">
                                浏览 <span className="text-[var(--accent)]">完整目录</span>
                            </h2>
                            <p className="text-gray-400 max-w-2xl">
                                这里模拟电商首页的主商品流，支持按分类快速切换，后续可继续接入分页、搜索和营销位配置。
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setFilter('all')} className={`px-5 py-3 rounded-full border ${filter === 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-gray-400'}`}>
                                全部
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setFilter(category.id)}
                                    className={`px-5 py-3 rounded-full border ${filter === category.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-gray-400'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 py-20 bg-[var(--surface)]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6">
                            趋势与 <span className="text-[var(--accent)]">新品</span>
                        </h2>
                        <p className="text-gray-400 mb-10">
                            通过接口返回 trending、newArrival、Banner 与推荐位配置，首页可以快速拼装专题区域。
                        </p>
                        <div className="space-y-4">
                            {homeContent.services.map((service) => (
                                <div key={service.title} className="border border-[var(--border)] rounded-2xl p-5">
                                    <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {[...trendingProducts.slice(0, 2), ...newArrivalProducts.slice(0, 2)].map((product) => (
                            <ProductCard key={`${product.id}-${product.name}`} product={product} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 py-20">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black mb-3">
                                    运营 <span className="text-[var(--accent)]">Banner</span>
                                </h2>
                                <p className="text-gray-400">Banner、优惠券与推荐位都已支持后台维护，并通过接口同步到首页。</p>
                            </div>
                            <Link to="/admin" className="btn-outline px-5 py-3 rounded-full text-sm">查看后台配置</Link>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {activeBanners.map((banner) => (
                                <Link key={banner.id} to={banner.link} className="group relative rounded-3xl overflow-hidden border border-[var(--border)] min-h-[280px] block">
                                    <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent"></div>
                                    <div className="relative z-10 p-8 max-w-md h-full flex flex-col justify-end">
                                        <div className="text-xs font-mono text-[var(--accent)] mb-3">运营 Banner</div>
                                        <h3 className="text-3xl font-black mb-3">{banner.title}</h3>
                                        <p className="text-gray-200 leading-relaxed">{banner.subtitle}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                            <h2 className="text-3xl font-black mb-6">可用优惠券</h2>
                            <div className="space-y-4">
                                {activeCoupons.map((coupon) => (
                                    <div key={coupon.id} className="border border-[var(--border)] rounded-2xl p-5">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <div className="font-bold">{coupon.code}</div>
                                            <div className="text-[var(--accent)] font-mono text-sm">
                                                {coupon.discountType === 'percent' ? `${coupon.value}% OFF` : `-¥${coupon.value}`}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{coupon.description}</p>
                                        <p className="text-xs text-gray-500">订单满 ¥{coupon.minAmount} 可使用，下单弹窗内支持校验和应用。</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            {recommendationSections.map((section) => (
                                <div key={section.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                                    <div className="mb-6">
                                        <h2 className="text-3xl font-black mb-2">{section.title}</h2>
                                        <p className="text-gray-400">{section.description}</p>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {section.products.map((product) => (
                                            <ProductCard key={`${section.id}-${product.id}`} product={product} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-20 bg-[var(--surface)]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            用户评价与 <span className="text-[var(--accent)]">常见问题</span>
                        </h2>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                        {homeContent.testimonials.map((item) => (
                            <div key={item.name} className="bg-[var(--primary)] border border-[var(--border)] rounded-3xl p-8">
                                <p className="text-lg leading-relaxed mb-6">“{item.quote}”</p>
                                <div>
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-gray-500 text-sm">{item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {homeContent.faqs.map((faq) => (
                            <div key={faq.question} className="border border-[var(--border)] rounded-2xl p-6">
                                <h3 className="font-bold mb-3">{faq.question}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Marquee />
        </div>
    );
};

export default Home;
