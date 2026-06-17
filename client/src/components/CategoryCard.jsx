import React, { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CategoryCard = ({ category }) => {
    const { navigateToCategory } = useStore();
    const cardRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (cardRef.current) {
                gsap.fromTo(cardRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        scrollTrigger: {
                            trigger: cardRef.current,
                            start: 'top 80%',
                            end: 'bottom 20%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }
        });
        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={cardRef}
            onClick={() => navigateToCategory(category.id)}
            className="category-card cursor-pointer bg-[var(--surface)] border-2 border-[var(--border)] rounded-3xl overflow-hidden group"
        >
            <div className="aspect-[4/3] overflow-hidden relative">
                <img
                    src={category.image}
                    alt={category.name}
                    className="category-image w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60"></div>
                <div className={`absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r ${category.gradient} text-white font-bold text-sm`}>
                    {category.count} Products
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-2xl font-black mb-2 group-hover:text-[var(--accent)] transition-colors">
                    {category.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                <div className="flex items-center text-[var(--accent)] font-mono text-sm group-hover:translate-x-2 transition-transform">
                    SHOP NOW
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;
