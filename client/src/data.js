export const CATEGORIES = [
    {
        id: 'headphones',
        name: '头戴耳机',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=700&fit=crop',
        description: '沉浸降噪与空间音频体验',
        count: 2,
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        id: 'earbuds',
        name: '真无线耳机',
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900&h=700&fit=crop',
        description: '轻量便携，适合通勤与运动',
        count: 2,
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        id: 'laptops',
        name: '高性能笔记本',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&h=700&fit=crop',
        description: '创作、办公与游戏三位一体',
        count: 2,
        gradient: 'from-orange-500 to-red-500',
    },
    {
        id: 'mice',
        name: '电竞鼠标',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900&h=700&fit=crop',
        description: '更高精度与更低延迟',
        count: 2,
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        id: 'keyboards',
        name: '机械键盘',
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=900&h=700&fit=crop',
        description: '可编程、热插拔与 RGB 联动',
        count: 2,
        gradient: 'from-fuchsia-500 to-rose-500',
    },
    {
        id: 'wearables',
        name: '智能穿戴',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&h=700&fit=crop',
        description: '健康监测与全天候连接',
        count: 2,
        gradient: 'from-sky-500 to-indigo-500',
    },
];

export const PRODUCTS_DATA = [
    { id: 1, sku: 'NXT-HP-001', name: 'AeroMesh Pro', category: 'headphones', brand: 'Nextron Audio', price: 299, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80', description: '旗舰级主动降噪头戴耳机，支持空间音频与 45 小时续航。', stock: 18, rating: 4.9, badge: '旗舰热卖', featured: true, trending: true, newArrival: false, tags: ['降噪', '空间音频'], specs: ['40mm 动圈单元', '蓝牙 5.4', '45h 续航'] },
    { id: 2, sku: 'NXT-HP-002', name: 'SonicWave Elite', category: 'headphones', brand: 'Nextron Studio', price: 349, image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=900&q=80', description: '面向创作者与音频工作流的专业监听耳机。', stock: 10, rating: 4.8, badge: '创作者首选', featured: true, trending: false, newArrival: true, tags: ['监听', '录音'], specs: ['高解析 DAC', '双模连接', '低延迟监听'] },
    { id: 3, sku: 'NXT-EB-003', name: 'Infinity Buds', category: 'earbuds', brand: 'Nextron Mobile', price: 149, image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900&q=80', description: '真无线降噪耳机，适合通勤和日常办公。', stock: 24, rating: 4.7, badge: '通勤推荐', featured: true, trending: true, newArrival: false, tags: ['ANC', '便携'], specs: ['双设备连接', '6 麦通话降噪', '30h 综合续航'] },
    { id: 4, sku: 'NXT-EB-004', name: 'PulseFit Air', category: 'earbuds', brand: 'Nextron Motion', price: 179, image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=900&q=80', description: '面向运动场景设计的轻量真无线耳机。', stock: 16, rating: 4.6, badge: '运动系列', featured: false, trending: true, newArrival: true, tags: ['防水', '运动'], specs: ['IPX7 防水', '耳挂设计', '快充'] },
    { id: 5, sku: 'NXT-LT-005', name: 'UltraBook X1', category: 'laptops', brand: 'Nextron Compute', price: 1299, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&q=80', description: '适合研发与高频办公的轻薄性能本。', stock: 9, rating: 4.9, badge: '商务旗舰', featured: true, trending: true, newArrival: false, tags: ['轻薄', '办公'], specs: ['16GB 内存', '1TB SSD', '2.8K 屏幕'] },
    { id: 6, sku: 'NXT-LT-006', name: 'CreatorPro 15', category: 'laptops', brand: 'Nextron Creator', price: 1699, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80', description: '面向设计、视频剪辑与 3D 工作流的创作本。', stock: 7, rating: 4.8, badge: '设计师推荐', featured: false, trending: false, newArrival: true, tags: ['创作', '高色准'], specs: ['32GB 内存', '独显', '100% DCI-P3'] },
    { id: 7, sku: 'NXT-MS-007', name: 'Sonic Mouse Pro', category: 'mice', brand: 'Nextron Gear', price: 89, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900&q=80', description: '低延迟无线电竞鼠标，兼顾手感与精度。', stock: 30, rating: 4.6, badge: '电竞热销', featured: false, trending: false, newArrival: false, tags: ['无线', '电竞'], specs: ['26000 DPI', 'PAW 传感器', '79g 重量'] },
    { id: 8, sku: 'NXT-MS-008', name: 'VelocityX RGB', category: 'mice', brand: 'Nextron Gear', price: 99, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900&q=80', description: '支持宏定义和 RGB 灯效联动的多模鼠标。', stock: 21, rating: 4.5, badge: 'RGB 联动', featured: false, trending: true, newArrival: true, tags: ['RGB', '宏定义'], specs: ['三模连接', '独立驱动', '电竞级微动'] },
    { id: 9, sku: 'NXT-KB-009', name: 'FluxBoard 75', category: 'keyboards', brand: 'Nextron Keys', price: 139, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=900&q=80', description: '75% 配列机械键盘，支持热插拔与多设备连接。', stock: 14, rating: 4.7, badge: '程序员优选', featured: true, trending: false, newArrival: true, tags: ['机械键盘', '热插拔'], specs: ['Gasket 结构', 'PBT 键帽', '三模连接'] },
    { id: 10, sku: 'NXT-KB-010', name: 'NightShift TKL', category: 'keyboards', brand: 'Nextron Keys', price: 119, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80', description: '适合游戏与夜间创作场景的紧凑型 RGB 键盘。', stock: 12, rating: 4.4, badge: '紧凑效率', featured: false, trending: false, newArrival: false, tags: ['TKL', 'RGB'], specs: ['可编程按键', '灯效联动', '铝合金定位板'] },
    { id: 11, sku: 'NXT-WR-011', name: 'Pulse Watch S', category: 'wearables', brand: 'Nextron Health', price: 259, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&q=80', description: '支持全天候心率、睡眠与训练分析的智能手表。', stock: 19, rating: 4.7, badge: '健康管理', featured: true, trending: true, newArrival: false, tags: ['健康监测', 'GPS'], specs: ['双频 GPS', '7 天续航', '多运动模式'] },
    { id: 12, sku: 'NXT-WR-012', name: 'Orbit Band Neo', category: 'wearables', brand: 'Nextron Health', price: 129, image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=900&q=80', description: '轻量化智能手环，适合初阶健康与睡眠追踪。', stock: 28, rating: 4.5, badge: '入门优选', featured: false, trending: false, newArrival: true, tags: ['睡眠追踪', '轻量'], specs: ['AMOLED 屏幕', '14 天续航', '50m 防水'] },
];

export const DEFAULT_SITE_CONFIG = {
    banners: [
        {
            id: 'banner-1',
            title: '企业采购周',
            subtitle: '笔记本、键鼠与会议耳机组合采购最高立减 12%',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80',
            link: '/products?category=laptops',
            active: true,
        },
        {
            id: 'banner-2',
            title: '新品首发计划',
            subtitle: '新品频道已支持运营推荐位和限时活动配置',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
            link: '/new-arrivals',
            active: true,
        },
    ],
    coupons: [
        {
            id: 'coupon-1',
            code: 'WELCOME100',
            description: '新客满 999 减 100',
            discountType: 'amount',
            value: 100,
            minAmount: 999,
            status: 'active',
        },
        {
            id: 'coupon-2',
            code: 'AUDIO10',
            description: '音频类商品 9 折',
            discountType: 'percent',
            value: 10,
            minAmount: 199,
            status: 'active',
        },
    ],
    recommendations: [
        {
            id: 'recommendation-1',
            title: '创作者工作流套装',
            description: '适合设计与内容团队的高性能设备组合',
            productIds: [2, 6, 9],
        },
        {
            id: 'recommendation-2',
            title: '远程办公组合',
            description: '面向高频会议与移动办公的轻量装备推荐',
            productIds: [1, 3, 5],
        },
    ],
};

export const SITE_CONTENT = {
    heroBadge: '2026 数字工作流装备升级计划',
    heroTitle: '为团队与个人打造一站式科技装备平台',
    heroSubtitle: '完整覆盖目录、下单、用户中心、管理后台与内容接口，适合继续扩展为正式电商项目。',
    heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
    stats: [
        { label: 'SKU', value: '12+' },
        { label: '核心接口', value: '28+' },
        { label: '满意度', value: '4.9★' },
    ],
    announcements: [
        '已支持商品检索、分类筛选、趋势新品推荐与用户中心。',
        '支持后台维护商品、订单状态、用户权限、运营配置与联系留言。',
        '未配置 MongoDB 时也可运行演示模式，便于本地开发。',
    ],
    services: [
        { title: '商品目录运营', description: '分类、标签、精选、趋势、新品接口统一由后端提供。'},
        { title: '用户体验闭环', description: '注册登录、购物车、心愿单、下单、资料维护、订单轨迹一站式完成。'},
        { title: '后台维护能力', description: '管理员可掌握营收概览、订单状态、商品 CRUD、用户权限、素材与操作日志。'},
    ],
    testimonials: [
        { name: '产品经理 Lin', role: 'B2C 项目负责人', quote: '现在这个仓库已经具备可演示的完整业务闭环。'},
        { name: '前端工程师 Zhou', role: 'React 开发', quote: 'client/server 分离后，页面和接口协作更清晰。'},
        { name: '后端工程师 Han', role: 'Node.js 开发', quote: '接口已经覆盖首页内容、用户中心和后台运营场景。'},
    ],
    faqs: [
        { question: '项目必须配置 MongoDB 吗？', answer: '不是。未配置 MONGO_URI 时，后端会进入演示模式并加载内置数据。' },
        { question: '如何体验管理员后台？', answer: '使用 admin@nextron.local / Admin12345! 即可登录演示管理员账号。' },
        { question: '为什么接口变多了？', answer: '为了支撑首页内容、商品运营、用户中心和后台管理四类场景，接口需要比最初版本更完整。' },
    ],
    shipping: [
        '满 199 元全国包邮，默认 48 小时内发出。',
        '支持标准配送与优先配送，后台可维护订单状态。',
        '签收 7 天内支持无理由退换。',
    ],
    warranty: [
        '耳机与外设默认 24 个月保修。',
        '穿戴类产品默认 12 个月保修。',
        '企业采购可扩展延保与批量设备维护服务。',
    ],
    contactInfo: {
        email: 'support@nextron.local',
        phone: '+86 400-900-2026',
        address: '上海市浦东新区张江高科技园区 Nextron Lab',
    },
    marketing: DEFAULT_SITE_CONFIG,
};

export const DEMO_ACCOUNTS = [
    { role: '管理员', email: 'admin@nextron.local', password: 'Admin12345!', permissionLevel: 'super-admin' },
    { role: '普通用户', email: 'demo@nextron.local', password: 'Demo12345!', permissionLevel: 'member' },
];
