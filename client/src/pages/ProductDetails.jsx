import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../data';

const ProductDetails = () => {
    const { id } = useParams();
    const { products, addToCart, addToWishlist, wishlist } = useStore();
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                    <Link to="/products" className="btn-primary px-6 py-2 rounded-full">Back to Products</Link>
                </div>
            </div>
        );
    }

    const isInWishlist = wishlist.some(item => item.id === product.id);
    const categoryName = CATEGORIES.find(c => c.id === product.category)?.name;
    const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div className="aspect-square bg-[var(--surface)] rounded-3xl overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="mb-6">
                            <span className="text-[var(--accent)] font-mono text-sm uppercase tracking-wider">{categoryName}</span>
                            <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4">{product.name}</h1>
                            <div className="text-3xl font-bold text-[var(--accent)]">${product.price}</div>
                        </div>

                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            {product.description} Experience the next level of technology with {product.name}.
                            Precision engineered for performance and designed for aesthetics.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                In Stock ({product.stock} units)
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Secure Payment
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Free Shipping
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 btn-primary py-4 rounded-full font-bold text-sm tracking-wide"
                            >
                                ADD TO CART
                            </button>
                            <button
                                onClick={() => addToWishlist(product)}
                                className={`w-14 flex items-center justify-center rounded-full border ${isInWishlist ? 'border-[var(--accent-2)] bg-[var(--accent-2)]/10 text-[var(--accent-2)]' : 'border-[var(--border)] hover:border-[var(--text)]'} transition-colors`}
                            >
                                <svg className="w-6 h-6" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="border-t border-[var(--border)] pt-16">
                        <h2 className="text-3xl font-black mb-8">RELATED <span className="text-[var(--accent)]">PRODUCTS</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
