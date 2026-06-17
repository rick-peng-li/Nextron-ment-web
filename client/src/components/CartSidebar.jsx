import React from 'react';
import { useStore } from '../context/StoreContext';

const CartSidebar = () => {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, setIsCheckoutOpen } = useStore();
    if (!isCartOpen) return null;

    return (
        <>
            <div className="fixed inset-0 modal-backdrop z-50" onClick={() => setIsCartOpen(false)}></div>
            <div className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-[var(--primary)] border-l border-[var(--border)] z-50 overflow-y-auto hide-scrollbar">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">CART <span className="text-[var(--accent)]">({cart.length})</span></h2>
                        <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-20">
                            <svg className="w-24 h-24 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-gray-500 font-mono">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6 mb-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                                        <div className="flex-1">
                                            <h3 className="font-bold mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">${item.price}</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-center">-</button>
                                                <span className="w-12 text-center font-mono">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-center">+</button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-[var(--accent-2)]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <div className="font-bold text-[var(--accent)]">${(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-[var(--border)] pt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-mono">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-mono text-[var(--accent)]">FREE</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t border-[var(--border)] pt-4">
                                    <span>Total</span>
                                    <span className="text-[var(--accent)]">${cartTotal.toFixed(2)}</span>
                                </div>
                                <button onClick={() => setIsCheckoutOpen(true)} className="w-full btn-primary py-4 rounded-full font-bold">
                                    PROCEED TO CHECKOUT
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
