import React from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data';

const WishlistSidebar = () => {
    const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, addToCart } = useStore();
    if (!isWishlistOpen) return null;

    return (
        <>
            <div className="fixed inset-0 modal-backdrop z-50" onClick={() => setIsWishlistOpen(false)}></div>
            <div className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-[var(--primary)] border-l border-[var(--border)] z-50 overflow-y-auto hide-scrollbar">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">WISHLIST <span className="text-[var(--accent)]">({wishlist.length})</span></h2>
                        <button onClick={() => setIsWishlistOpen(false)} className="w-10 h-10 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {wishlist.length === 0 ? (
                        <div className="text-center py-20">
                            <svg className="w-24 h-24 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <p className="text-gray-500 font-mono">Your wishlist is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {wishlist.map(item => (
                                <div key={item.id} className="flex gap-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{CATEGORIES.find(c => c.id === item.category)?.name}</p>
                                        <div className="text-lg font-bold text-[var(--accent)] mb-3">${item.price}</div>
                                        <button
                                            onClick={() => { addToCart(item); removeFromWishlist(item.id); }}
                                            className="btn-primary px-4 py-2 rounded-full text-xs font-mono"
                                        >
                                            ADD TO CART
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromWishlist(item.id)} className="text-gray-500 hover:text-[var(--accent-2)]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WishlistSidebar;
