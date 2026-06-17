import React from 'react';
import { DEMO_ACCOUNTS } from '../data';

const About = () => {
    return (
        <div className="min-h-screen px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-black mb-8">
                    关于 <span className="text-[var(--accent)]">NEXTRON</span>
                </h2>
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
                        <p>Nextron-ment-web 现在是一个前后端分离的全栈电商项目，前端放在 client，后端放在 server，核心目标是让目录组织、接口分层和后续维护更加清晰。</p>
                        <p>项目除了原有商品浏览与登录注册能力，还补充了用户资料维护、联系留言、订单状态流转、后台商品管理与内容接口，页面与接口之间形成完整闭环。</p>
                        <p>后端支持 MongoDB 真实数据模式，同时兼容演示模式，未配置数据库时也能直接启动并体验完整流程，适合演示、教学和二次开发。</p>
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
                        <h3 className="text-2xl font-bold mb-6">演示账号</h3>
                        <div className="space-y-4">
                            {DEMO_ACCOUNTS.map((account) => (
                                <div key={account.email} className="border border-[var(--border)] rounded-2xl p-5">
                                    <div className="text-sm text-gray-500 mb-1">{account.role}</div>
                                    <div className="font-mono text-sm">{account.email}</div>
                                    <div className="font-mono text-sm text-[var(--accent)] mt-1">{account.password}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {[
                        { title: '前端架构', content: 'React + Vite + React Router + Context，负责页面渲染、状态管理和接口消费。' },
                        { title: '后端架构', content: 'Node.js + Express + JWT + Mongoose，负责鉴权、商品、订单、留言与后台接口。' },
                        { title: '维护方式', content: 'client / server 目录分离，README 与脚本统一在根目录编排，方便独立演进。' },
                    ].map((item) => (
                        <div key={item.title} className="p-8 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
                            <div className="text-2xl font-bold text-[var(--accent)] mb-3">{item.title}</div>
                            <div className="text-gray-400 leading-relaxed">{item.content}</div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        '商品中心与专题页支持分类、搜索、排序、精选、趋势与新品模块。',
                        '用户中心支持购物车、心愿单、订单查看与资料维护。',
                        '后台可维护商品 CRUD、订单状态和联系留言。',
                        '联系支持页已对接后端留言接口，可作为售后入口。',
                    ].map((item) => (
                        <div key={item} className="border border-[var(--border)] rounded-2xl p-6 text-gray-400">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
