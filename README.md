# 🪪 Web Card - 极简个人主页生成器 (Minimalist Personal Homepage Generator)

![License](https://img.shields.io/badge/license-MIT-blue)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange)
![React](https://img.shields.io/badge/React-18-61DAFB)

本项目是一个基于 **Cloudflare 生态系统**（Pages、D1 及 Functions）构建的全栈无服务器（Serverless）应用程序。系统具备零成本部署优势、所见即所得（WYSIWYG）的编辑交互体验、高性能图像压缩算法及全方位的自定义配置能力。

---

## ✨ 核心特性 (Core Features)

- **⚡️ 全栈无服务器架构 (Full-stack Serverless Architecture)**
  前端采用静态资源托管，后端基于 Functions API 构建，全量运行于边缘网络节点，实现毫秒级响应延迟。

- **🎨 可视化编辑体验 (WYSIWYG Editor)**
  提供所见即所得的编辑模式，确保编辑界面与预览效果的高度一致性，支持实时的文本内容修改。

- **🖐️ 交互式拖拽排序 (Interactive Drag-and-Drop Sorting)**
  内置流畅的拖拽交互逻辑，支持对链接、标题及分割线等组件进行自由排序。

- **🖼️ 高性能图像处理引擎 (High-Performance Image Processing)**
  前端集成 Canvas 图像处理能力，自动将上传的头像或背景图裁剪并压缩至 500px/JPG 格式，显著优化数据库存储占用。

- **🌈 多维度个性化定制 (Deep Personalization)**
  内置多款高雅的渐变色主题（如海盐蓝、薄荷青、樱花粉等）。支持自定义色彩体系及自定义背景图像上传。提供精细化的圆角风格（涵盖卡片、头像、按钮）及排版对齐控制。

- **📱 自适应响应式设计 (Adaptive Responsive Design)**
  遵循移动优先原则，完美适配移动端、平板电脑及桌面端设备。

- **🔐 企业级安全鉴权 (Enterprise-grade Authentication)**
  采用基于 HttpOnly Cookie 的管理员登录机制，结合 JWT 签名技术，保障系统安全性。

---

## 🛠️ 技术栈 (Technical Stack)

| 类别 | 技术方案 |
| :--- | :--- |
| **前端框架** | React, Vite, Tailwind CSS, Lucide React (Iconography) |
| **后端服务** | Cloudflare Pages Functions |
| **数据库** | Cloudflare D1 (Serverless SQLite) |
| **部署平台** | Cloudflare Pages |

---

## 🚀 部署指南 (Deployment Guide)

本系统支持快速部署流程，以下为详细操作步骤。

### 1. 前置准备 (Prerequisites)
- 注册并拥有 GitHub 账号。
- 注册并拥有 Cloudflare 账号。
- 确保本地环境已安装 Node.js（用于项目构建）。

### 2. 数据库初始化 (Database Initialization)
1. 登录 Cloudflare 控制台（Dashboard）。
2. 导航至 `Workers & Pages` -> `D1 SQL Database`。
3. 点击 **Create**，创建一个名为 `webcard-db` 的数据库实例。
4. 进入数据库详情页，选择 **Console** 标签页，粘贴并执行以下 SQL 语句以初始化数据表结构：

```sql
CREATE TABLE IF NOT EXISTS users (
    name TEXT PRIMARY KEY,
    password TEXT,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 代码仓库集成 (Repository Integration)
1. 将本项目代码 Fork 或 Push 至您的 GitHub 仓库。
2. 返回 Cloudflare 控制台，导航至 `Workers & Pages` -> `Create application` -> `Pages` -> `Connect to Git`。
3. 授权并选择相应的 GitHub 仓库。
4. **构建配置 (Build Configuration)**：
    - **Framework preset**: 选择 `Vite`
    - **Build command**: 输入 `npm run build`
    - **Build output directory**: 输入 `dist`

### 4. 资源绑定与环境变量配置 (Resource Binding & Env Vars)
在点击 "Save and Deploy" 之前（或部署失败后进入 Settings 修改），需完成以下配置：

#### A. 数据库绑定 (Database Binding)
- 进入项目设置页面 `Settings` -> `Functions`。
- 定位至 **D1 Database Bindings** 区域。
- 点击 **Add binding**：
    - **Variable name**: 输入 `DB` (注意：必须保持大写，以便代码识别)
    - **D1 Database**: 选择步骤 2 中创建的 `webcard-db`。

#### B. 管理员账号配置 (Admin Credentials)
- 进入项目设置页面 `Settings` -> `Environment variables`。
- 添加以下环境变量：
    - `ADMIN_USER`: 配置管理员用户名（例如：admin）。
    - `ADMIN_PASS`: 配置管理员密码。
    - `JWT_SECRET`: 配置用于 Token 签名的随机字符串（建议使用高强度随机字符）。

### 5. 执行部署 (Execute Deployment)
所有配置完成后，进入 **Deployments** 选项卡，点击最新部署记录右侧的菜单按钮，选择 **Retry deployment** 以触发重新部署。

---

## 💻 本地开发环境 (Local Development)

### 1. 依赖安装
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

> **注意**：`npm run dev` 命令仅启动前端 React 开发服务器。鉴于后端逻辑依赖 Cloudflare Functions 运行时环境，本地开发模式下涉及 API 交互（如登录、保存数据）的功能将无法正常工作。建议使用 `wrangler` CLI 工具进行全栈本地模拟，或直接编写前端 UI 逻辑。

---

## 📂 目录结构 (Directory Structure)

```text
/
├── functions/          # 后端 API 逻辑 (Cloudflare Pages Functions)
│   └── api/
│       ├── auth.js     # 身份验证与注册模块
│       └── user.js     # 用户数据 CRUD 操作模块
├── src/                # 前端 React 源代码
│   ├── App.jsx         # 核心应用逻辑 (包含所有 UI 组件)
│   ├── main.jsx        # 应用入口文件
│   └── index.css       # Tailwind 样式入口文件
├── public/             # 静态资源目录
├── index.html          # HTML 模板文件
└── vite.config.js      # Vite 构建配置文件
```

---

## 📄 许可证 (License)

本项目遵循 [MIT 许可证](LICENSE)。
