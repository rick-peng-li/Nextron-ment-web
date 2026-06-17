<!-- 项目 Git 地址：git@github.com:rick-peng-li/Nextron-ment-web.git -->

# Nextron-ment-web

Nextron-ment-web 已整理为前后端分离的全栈电商项目：项目围绕“科技数码电商平台”场景构建，覆盖商品浏览、搜索筛选、购物车、心愿单、下单、用户中心、联系留言、后台管理等完整链路。

## 项目亮点

- 前后端彻底分层：前端页面、组件、状态管理放在 `client`，接口、模型、鉴权、种子数据放在 `server`
- 功能闭环更完整：不仅有商品展示，还补齐了用户中心、订单流转、联系留言、后台运营管理
- 接口数量更合理：不再只有少量基础接口，而是覆盖首页内容、商品中心、用户中心、后台管理四类场景
- 支持演示模式：未配置 MongoDB 时，后端仍可使用内置数据启动，方便本地演示和联调
- 文档与结构统一：根目录负责统一脚本、忽略规则和项目说明，便于团队维护

## 目录结构

```text
Nextron-ment-web/
├─ client/                     # React + Vite 前端应用
│  ├─ src/
│  │  ├─ components/           # 公共组件（导航、页脚、购物车、结算等）
│  │  ├─ context/              # 全局状态与接口调用封装
│  │  ├─ pages/                # 页面级模块
│  │  ├─ data.js               # 演示数据与站点内容
│  │  └─ App.jsx               # 路由与页面装配
│  └─ package.json
├─ server/                     # Node.js + Express 后端服务
│  ├─ data/                    # 种子数据
│  ├─ middleware/              # 鉴权中间件
│  ├─ models/                  # Mongoose 模型
│  ├─ index.js                 # API 入口
│  └─ seed.js                  # 数据初始化脚本
├─ package.json                # 根目录脚本入口
├─ .gitignore
└─ README.md
```

## 技术架构

### 前端

- React 19
- Vite 7
- React Router
- Context API
- Tailwind CSS
- GSAP

### 后端

- Node.js
- Express
- JWT 鉴权
- Mongoose
- bcryptjs
- body-parser / cors / dotenv

### 数据与运行模式

- 默认支持 MongoDB 持久化模式
- 未配置 `MONGO_URI` 时自动回退到演示模式
- 演示模式下使用内置商品、站点内容、订单与用户数据

## 前端模块说明

### 1. 首页模块

- Hero 首屏：展示站点定位、统计信息和入口按钮
- 分类浏览：展示头戴耳机、真无线耳机、笔记本、键鼠、穿戴等品类
- 精选商品：展示首页主推 SKU
- 趋势与新品：基于后端字段快速组织营销专区
- 评价与 FAQ：增强内容感和业务完整度

### 2. 商品中心

- 商品列表页支持分类、关键词搜索、排序
- 商品详情页展示价格、标签、规格、库存、相关推荐
- 趋势页与新品页独立成专题频道，便于活动扩展

### 3. 用户功能

- 注册、登录、获取当前登录用户
- 购物车增删改
- 心愿单管理
- 下单与订单记录查看
- 用户资料维护，包括电话、地址、订阅偏好

### 4. 运营与支持

- 联系支持页面接入留言接口
- FAQ、物流退换、保修政策页面独立维护
- About 页面用于展示项目架构和演示账号信息

### 5. 管理后台

- 商品列表、商品新增、商品编辑、商品删除
- 订单状态流转管理
- 留言查看
- 经营概览统计，包括商品数、订单数、营收、低库存、留言数量

## 页面设计说明

| 页面 | 路径 | 主要功能 |
| --- | --- | --- |
| 首页 | `/` | 首屏展示、分类浏览、精选商品、趋势新品、FAQ |
| 商品中心 | `/products` | 商品搜索、分类过滤、排序 |
| 商品详情 | `/product/:id` | 查看商品信息、加入购物车、收藏 |
| 趋势精选 | `/trending` | 展示趋势商品专题 |
| 新品首发 | `/new-arrivals` | 展示新品商品专题 |
| 关于项目 | `/about` | 项目说明、演示账号、架构概览 |
| 联系支持 | `/contact` | 提交联系留言 |
| 常见问题 | `/faq` | 展示常见问答 |
| 物流与退换 | `/shipping` | 展示配送与售后规则 |
| 保修政策 | `/warranty` | 展示保修说明 |
| 用户中心 | `/profile` | 资料、订单、心愿单、账户概览 |
| 管理后台 | `/admin` | 商品、订单、留言管理 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/signup` | 新用户注册 |

## 接口设计

当前项目接口已经不再局限于最初少量接口，而是形成了比较完整的业务分层。

### 公共与内容接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查、返回运行模式与演示账号 |
| GET | `/api/content/home` | 获取首页内容、FAQ、物流、保修、Banner、优惠券与推荐位 |
| GET | `/api/coupons` | 获取已启用优惠券列表 |
| POST | `/api/coupons/validate` | 校验优惠码并返回优惠后的订单金额 |

### 商品接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET | `/api/products` | 获取商品列表，支持分类/搜索/排序/精选筛选 |
| GET | `/api/products/categories` | 获取分类列表 |
| GET | `/api/products/trending` | 获取趋势商品 |
| GET | `/api/products/new-arrivals` | 获取新品商品 |
| GET | `/api/products/:id` | 获取商品详情 |

### 认证接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| POST | `/api/auth/signup` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前登录用户 |

### 用户中心接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET | `/api/user/data` | 获取用户聚合数据 |
| GET | `/api/user/profile` | 获取用户资料 |
| PUT | `/api/user/profile` | 更新用户资料 |
| GET | `/api/user/dashboard` | 获取用户中心概览数据 |
| PUT | `/api/user/cart` | 更新购物车 |
| PUT | `/api/user/wishlist` | 更新心愿单 |
| GET | `/api/user/orders` | 获取订单列表 |
| GET | `/api/user/orders/:id` | 获取订单详情、优惠信息与物流轨迹 |
| POST | `/api/user/order` | 提交订单，自动写入运单号与初始轨迹 |

### 联系支持接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| POST | `/api/contact` | 提交联系留言 |

### 后台管理接口

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET | `/api/admin/summary` | 获取后台经营概览 |
| GET | `/api/admin/orders` | 获取后台订单列表 |
| GET | `/api/admin/orders/:id` | 获取后台订单详情 |
| PATCH | `/api/admin/orders/:id/status` | 快速更新订单状态 |
| PATCH | `/api/admin/orders/:id/fulfillment` | 更新订单状态、运单号并追加自定义物流节点 |
| GET | `/api/admin/users` | 获取用户列表、角色与消费统计 |
| PUT | `/api/admin/users/:id` | 更新用户角色、权限等级与权限点 |
| GET | `/api/admin/site-config` | 获取运营配置 |
| PUT | `/api/admin/site-config` | 更新 Banner、优惠券、推荐位配置 |
| GET | `/api/admin/assets` | 获取素材库列表 |
| POST | `/api/admin/assets/upload` | 上传本地素材或登记远程素材链接 |
| DELETE | `/api/admin/assets/:id` | 删除素材库文件或远程素材记录 |
| GET | `/api/admin/logs` | 获取后台操作日志 |
| POST | `/api/admin/products` | 新增商品 |
| PUT | `/api/admin/products/:id` | 更新商品 |
| DELETE | `/api/admin/products/:id` | 删除商品 |
| GET | `/api/admin/messages` | 获取联系留言列表 |
| PATCH | `/api/admin/messages/:id/status` | 更新留言跟进状态 |

## 数据模型设计

### User

- 基础信息：姓名、邮箱、密码、角色
- 扩展信息：电话、地址、偏好设置
- 业务数据：购物车、心愿单、订单关联

### Product

- 基础字段：名称、分类、品牌、价格、图片、描述
- 运营字段：SKU、评分、标签、角标、精选、趋势、新品
- 库存字段：库存、规格

### Order

- 订单商品项
- 客户信息
- 订单原价与实付金额
- 已使用优惠券信息
- 支付方式与配送方式
- 订单状态、运单号、物流轨迹
- 创建时间

### ContactMessage

- 姓名
- 邮箱
- 主题
- 留言内容
- 处理状态
- 创建时间

### SiteConfig

- Banner 配置
- 优惠券配置
- 推荐位配置
- 统一的首页运营内容源

### Asset

- 素材文件名
- MIME 类型与大小
- 存储提供方与桶标识
- 可访问 URL
- 上传人信息

### OperationLog

- 操作人
- 操作类型
- 目标资源
- 摘要信息
- 扩展元数据
- 创建时间

## 启动方式

### 1. 安装依赖

在项目根目录执行：

```bash
npm run client:install
npm run server:install
```

也可以分别进入 `client`、`server` 执行 `npm install`。

### 2. 启动后端

```bash
npm run server:dev
```

默认后端地址：

```text
http://localhost:5000
```

### 3. 启动前端

新开一个终端执行：

```bash
npm run client:dev
```

默认前端地址：

```text
http://localhost:5173
```

### 4. 初始化数据

```bash
npm run server:seed
```

## 环境变量

请在 `server` 目录下创建 `.env` 文件：

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

说明：

- 如果配置了 `MONGO_URI`，项目会使用 MongoDB
- 如果未配置 `MONGO_URI`，项目会进入演示模式
- `JWT_SECRET` 用于签发登录令牌，正式环境请使用高强度密钥

## 账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 管理员 | `admin@nextron.local` | `Admin12345!` |
| 普通用户 | `demo@nextron.local` | `Demo12345!` |


## 本轮新增能力

- 已补充订单详情页与物流轨迹，用户可在个人中心查看完整履约进度
- 已补充后台履约接口，可维护订单状态、运单号并追加自定义物流节点，前台订单详情页实时承接该数据
- 已补充管理员用户管理接口与后台页面，支持角色、权限等级、权限点维护
- 已补充优惠券、活动 Banner、推荐位配置，并同步到首页展示与下单流程
- 已补充图片上传与素材库能力，兼容本地上传、远程素材登记与后台删除
- 已补充联系留言跟进状态流转与后台权限分级、操作日志，便于演示模式和后续真实业务扩展
- 后续仍可继续接入真实支付、短信通知、第三方物流与对象存储服务

