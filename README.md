🪪 Web Card - 极简个人主页生成器

基于 Cloudflare 生态 (Pages + D1 + Functions) 构建的全栈 Serverless 应用。
零成本部署、所见即所得 (WYSIWYG)、高性能图片压缩、完全自定义。

✨ 核心特性 (Features)

⚡️ 全栈无服务器 (Serverless): 前端静态托管 + 后端 Functions API，毫秒级响应，完全运行在边缘网络。

🎨 所见即所得 (WYSIWYG): 编辑模式与预览模式完全一致，支持实时文本编辑。

🖐️ 拖拽排序: 支持链接、标题、分割线的丝滑拖拽排序。

🖼️ 智能图片处理: 前端 Canvas 自动压缩图片（头像/背景）至 500px/JPG，极大节省数据库空间。

🌈 深度个性化:

内置多款清新渐变主题（海盐蓝、薄荷青、樱花粉等）。

支持 自定义颜色 和 自定义背景图。

可调节 圆角风格（卡片、头像、按钮）和 排版对齐。

📱 响应式设计: 完美适配移动端、平板和桌面端。

🔐 安全鉴权: 基于 HttpOnly Cookie 的管理员登录与 JWT 签名机制。

🛠️ 技术栈 (Tech Stack)

Frontend: React, Vite, Tailwind CSS, Lucide React (图标库)

Backend: Cloudflare Pages Functions

Database: Cloudflare D1 (SQLite)

Deploy: Cloudflare Pages

🚀 部署指南 (Deployment)

只需 5 分钟，即可免费部署属于你的全栈系统。

1. 准备工作

拥有一个 GitHub 账号。

拥有一个 Cloudflare 账号。

本地安装了 Node.js (用于构建项目)。

2. 创建 D1 数据库

登录 Cloudflare Dashboard。

进入 Workers & Pages -> D1 SQL Database。

点击 Create，创建一个数据库，命名为 web-card-db。

进入数据库详情页，点击 Console 标签，粘贴并执行以下 SQL 初始化表结构：

CREATE TABLE IF NOT EXISTS users (
    name TEXT PRIMARY KEY,
    password TEXT,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


3. 连接 GitHub 并创建项目

将本项目代码 Fork 或 Push 到你的 GitHub 仓库。

回到 Cloudflare Dashboard，进入 Workers & Pages -> Create application -> Pages -> Connect to Git。

选择你的仓库。

构建配置 (Build configuration)：

Framework preset: Vite

Build command: npm run build

Build output directory: dist

4. 绑定资源与环境变量 (关键步骤)

在点击 "Save and Deploy" 之前（或部署失败后去 Settings 修改）：

A. 绑定数据库

进入项目设置 Settings -> Functions。

找到 D1 Database Bindings。

点击 Add binding：

Variable name: DB (必须大写，与代码一致)

D1 Database: 选择你刚才创建的 web-card-db。

B. 设置管理员账号

进入项目设置 Settings -> Environment variables。

添加以下变量：

ADMIN_USER: admin (你的管理员用户名)

ADMIN_PASS: password (你的管理员密码)

JWT_SECRET: 任何复杂的随机字符串 (用于签名 Token)

5. 重新部署

配置完成后，进入 Deployments 选项卡，点击最新的部署记录右侧的菜单，选择 Retry deployment。

💻 本地开发 (Local Development)

1. 安装依赖

npm install


2. 启动开发服务器

npm run dev


注意：npm run dev 仅启动前端 React 服务器。由于后端依赖 Cloudflare Functions 环境，本地开发时 API 请求（登录、保存）会失败。建议使用 wrangler 进行全栈模拟，或者直接编写前端 UI 逻辑。

📂 目录结构

/
├── functions/          # 后端 API (Cloudflare Pages Functions)
│   └── api/
│       ├── auth.js     # 登录与注册逻辑
│       └── user.js     # 用户数据 CRUD
├── src/                # 前端 React 代码
│   ├── App.jsx         # 主应用逻辑 (包含所有 UI 组件)
│   ├── main.jsx        # 入口文件
│   └── index.css       # Tailwind 样式入口
├── public/             # 静态资源
├── index.html          # HTML 模板
└── vite.config.js      # Vite 配置


📄 License

MIT License.
