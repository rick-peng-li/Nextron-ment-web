import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ product }) => {
    const { addToCart, addToWishlist, wishlist } = useStore();
    const isInWishlist = wishlist.some(item => item.id === product.id);
    const cardRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (cardRef.current) {
                gsap.fromTo(cardRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        scrollTrigger: {
                            trigger: cardRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }
        });
        return () => ctx.revert();
    }, []);

    return (
        <div ref={cardRef} className="product-card bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="aspect-square bg-[var(--primary)] relative overflow-hidden group">
                <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="product-image w-full h-full object-cover cursor-pointer" />
                </Link>
                <button
                    onClick={() => addToWishlist(product)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--primary)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent-2)] transition-colors"
                >
                    <svg className={`w-5 h-5 ${isInWishlist ? 'fill-[var(--accent-2)] stroke-[var(--accent-2)]' : 'stroke-[var(--text)]'}`} fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                {product.stock < 10 && (
                    <div className="absolute top-4 left-4 bg-[var(--accent-2)] text-[var(--primary)] px-3 py-1 rounded-full text-xs font-bold">
                        LOW STOCK
                    </div>
                )}
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-[var(--accent)]">${product.price}</div>
                    <button
                        onClick={() => addToCart(product)}
                        className="btn-primary px-6 py-3 rounded-full font-mono text-xs"
                    >
                        ADD TO CART
                    </button>
                </div>
                <div className="mt-4 text-xs font-mono text-gray-500">{product.stock} units available</div>
            </div>
        </div>
    );
};

export default ProductCard;
