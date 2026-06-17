import React from 'react';

const Marquee = () => (
    <div className="border-y border-[var(--border)] py-6 overflow-hidden bg-[var(--surface)]">
        <div className="flex whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="marquee flex items-center space-x-12 font-mono text-sm text-gray-400">
                    {['FREE SHIPPING', '30-DAY RETURNS', '2-YEAR WARRANTY', '24/7 SUPPORT', 'SECURE CHECKOUT'].map((text, j) => (
                        <span key={j} className="mx-6">★ {text}</span>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export default Marquee;
