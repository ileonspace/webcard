🪪 Web Card - 极简个人主页 (Production Ready)这是一个基于 React + Vite 构建，部署在 Cloudflare Pages (Functions + D1) 上的全栈个人主页系统。它支持用户注册、登录、在线编辑、图片上传（自动压缩）和自定义主题。🚀 部署步骤 (Cloudflare Pages)1. 准备工作拥有一个 GitHub 账号。拥有一个 Cloudflare 账号。本地安装了 Node.js (用于构建)。2. 创建 D1 数据库登录 Cloudflare Dashboard。进入 Workers & Pages -> D1 SQL Database。点击 Create，创建一个数据库，命名为 web-card-db。进入数据库详情页，点击 Console 标签，粘贴并执行以下 SQL 初始化表：CREATE TABLE IF NOT EXISTS users (
    name TEXT PRIMARY KEY,
    password TEXT,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
3. 连接 GitHub 并创建项目将本项目代码推送到你的 GitHub 仓库。回到 Cloudflare Dashboard，进入 Workers & Pages -> Create application -> Pages -> Connect to Git。选择你的仓库。Build settings (构建配置)：Framework preset: ViteBuild command: npm run buildBuild output directory: dist4. 绑定资源 (关键步骤)在点击 "Save and Deploy" 之前（或部署失败后去 Settings 修改）：绑定 D1 数据库：Settings -> Functions -> D1 Database Bindings。Variable name: DB (必须大写)。Select database: 选择刚才创建的 web-card-db。设置环境变量：Settings -> Environment variables。添加 ADMIN_USER: 设置你的管理员用户名。添加 ADMIN_PASS: 设置你的管理员密码。5. 重新部署配置完成后，进入 Deployments 选项卡，点击最新的部署右侧的三个点，选择 Retry deployment。🛠️ 本地开发安装依赖：npm install
启动开发服务器 (仅前端)：npm run dev
注意：本地开发模式下 API 请求会失败，建议直接配置 wrangler 进行本地全栈模拟，或直接推送到 Cloudflare 测试。✨ 功能特性⚡️ Serverless: 前后端完全运行在边缘网络。🎨 所见即所得: 编辑模式与预览模式完全一致。🖼️ 智能压缩: 前端自动压缩图片至 500px/JPG，节省数据库空间。🌈 主题定制: 内置多款清新渐变主题，支持自定义颜色。📱 响应式: 完美适配移动端。
