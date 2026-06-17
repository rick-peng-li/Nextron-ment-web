import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import gsap from 'gsap';

const Hero = () => {
    const { homeContent } = useStore();

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-title', { y: 80, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
            gsap.from('.hero-subtitle', { y: 40, opacity: 0, duration: 1, delay: 0.35, ease: 'power3.out' });
            gsap.from('.hero-cta', { y: 20, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' });
            gsap.from('.hero-image', { scale: 0.88, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, []);

    const scrollToProducts = () => {
        const section = document.getElementById('featured-products');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--accent)] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-2)] rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                    <div className="inline-block mb-6 px-4 py-2 border border-[var(--accent)] rounded-full">
                        <span className="font-mono text-xs text-[var(--accent)]">{homeContent.heroBadge}</span>
                    </div>
                    <h1 className="hero-title text-5xl md:text-7xl font-black leading-tight mb-6">
                        {homeContent.heroTitle}
                    </h1>
                    <p className="hero-subtitle text-xl text-gray-400 mb-8 max-w-xl">
                        {homeContent.heroSubtitle}
                    </p>
                    <div className="hero-cta flex flex-wrap gap-4">
                        <a href="#shop" className="btn-primary px-8 py-4 rounded-full font-mono text-sm inline-block text-center pt-4">
                            浏览分类
                        </a>
                        <button onClick={scrollToProducts} className="btn-outline px-8 py-4 rounded-full font-mono text-sm">
                            查看精选商品
                        </button>
                    </div>
                    <div className="mt-12 flex items-center space-x-8 font-mono text-sm flex-wrap gap-y-4">
                        {homeContent.stats.map((item) => (
                            <div key={item.label}>
                                <div className="text-3xl font-bold text-[var(--accent)]">{item.value}</div>
                                <div className="text-gray-500">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative hero-image">
                    <div className="aspect-square rounded-3xl overflow-hidden floating border border-[var(--border)] bg-[var(--surface)]">
                        <img src={homeContent.heroImage} alt="Nextron Hero" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
