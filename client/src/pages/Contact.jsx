import React, { useState } from 'react';
import gsap from 'gsap';
import { useStore } from '../context/StoreContext';

const Contact = () => {
    const { homeContent, submitContact } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '产品咨询',
        message: '',
    });
    const [status, setStatus] = useState({ type: '', text: '' });
    const [submitting, setSubmitting] = useState(false);

    React.useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.contact-content', { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
        });
        return () => ctx.revert();
    }, []);

    const handleChange = (event) => {
        setFormData((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', text: '' });

        try {
            const result = await submitContact(formData);
            setStatus({ type: 'success', text: result.message });
            setFormData({ name: '', email: '', subject: '产品咨询', message: '' });
        } catch (error) {
            setStatus({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
                <div className="contact-content">
                    <h1 className="text-5xl md:text-6xl font-black mb-8">
                        联系 <span className="text-[var(--accent)]">支持</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                        该页面已接入后端留言接口，提交内容后管理员可在后台查看，适合继续扩展售后工单或客服系统。
                    </p>

                    <div className="space-y-8">
                        {[
                            { title: '邮箱', value: homeContent.contactInfo.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                            { title: '电话', value: homeContent.contactInfo.phone, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                            { title: '地址', value: homeContent.contactInfo.address, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--accent-2)] text-sm mb-1">{item.title}</h3>
                                    <p className="text-lg font-mono">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="contact-content bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 md:p-12">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">姓名</label>
                                <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] transition-colors" placeholder="请输入姓名" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">邮箱</label>
                                <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] transition-colors" placeholder="请输入邮箱" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1">主题</label>
                            <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] transition-colors appearance-none">
                                <option value="产品咨询">产品咨询</option>
                                <option value="订单售后">订单售后</option>
                                <option value="接口合作">接口合作</option>
                                <option value="企业采购">企业采购</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1">留言内容</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" className="w-full bg-[var(--primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] transition-colors" placeholder="请描述你的需求或问题" required></textarea>
                        </div>
                        {status.text && (
                            <div className={`rounded-2xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                                {status.text}
                            </div>
                        )}
                        <button type="submit" disabled={submitting} className="w-full btn-primary py-4 rounded-xl font-bold tracking-wide disabled:opacity-70">
                            {submitting ? '提交中...' : '提交留言'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
