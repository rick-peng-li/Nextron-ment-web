import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Footer = () => {
    const { homeContent } = useStore();

    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] pt-20 pb-10 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div>
                    <Link to="/" className="text-3xl font-black tracking-tighter mb-6 block">
                        NEXTRON<span className="text-[var(--accent)]">.</span>
                    </Link>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        以完整前后端能力构建的科技电商项目样板，覆盖商品目录、下单流程、用户中心和管理后台。
                    </p>
                    <div className="space-y-3 text-sm text-gray-400">
                        <p>{homeContent.contactInfo.email}</p>
                        <p>{homeContent.contactInfo.phone}</p>
                        <p>{homeContent.contactInfo.address}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold mb-6 text-lg">业务模块</h3>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li><Link to="/products" className="hover:text-[var(--accent)] transition-colors">商品中心</Link></li>
                        <li><Link to="/trending" className="hover:text-[var(--accent)] transition-colors">趋势精选</Link></li>
                        <li><Link to="/new-arrivals" className="hover:text-[var(--accent)] transition-colors">新品首发</Link></li>
                        <li><Link to="/profile" className="hover:text-[var(--accent)] transition-colors">用户中心</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-6 text-lg">支持页面</h3>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">联系支持</Link></li>
                        <li><Link to="/faq" className="hover:text-[var(--accent)] transition-colors">常见问题</Link></li>
                        <li><Link to="/shipping" className="hover:text-[var(--accent)] transition-colors">物流与退换</Link></li>
                        <li><Link to="/warranty" className="hover:text-[var(--accent)] transition-colors">保修政策</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-6 text-lg">项目亮点</h3>
                    <div className="space-y-4 text-sm text-gray-400">
                        {homeContent.announcements.map((item) => (
                            <div key={item} className="border border-[var(--border)] rounded-2xl p-4">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono gap-4">
                <p>© 2026 NEXTRON. Frontend in client / Backend in server.</p>
                <div className="flex gap-8">
                    <Link to="/about" className="hover:text-white transition-colors">架构说明</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">接口反馈</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
