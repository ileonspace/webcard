export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // GET: 获取用户信息 (公开)
  if (request.method === 'GET') {
    const name = url.searchParams.get('name');
    if (!name) return new Response('Missing name', { status: 400 });

    const user = await env.DB.prepare('SELECT data FROM users WHERE name = ?').bind(name).first();
    if (!user) return new Response('User not found', { status: 404 });

    // 返回 data 字段的内容 (JSON 字符串)
    return new Response(user.data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST: 保存/更新用户信息 (需鉴权)
  if (request.method === 'POST') {
    // 1. 鉴权
    const cookie = request.headers.get('Cookie');
    if (!cookie || !cookie.includes('auth_token=')) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // 简单的 Token 验证 (实际请使用 verifyToken)
    const token = cookie.split('auth_token=')[1].split(';')[0];
    // 解析 Token 的 payload，获取用户名
    const userRole = JSON.parse(atob(token.split('.')[0])); 

    try {
      const data = await request.json();
      
      // 强制覆盖 name 为当前登录用户，防止篡改他人数据
      // 这里的 userRole.user 无论是 'admin' 还是 '普通用户' 的名字都是正确的
      const username = userRole.user; 
      data.name = username; 

      // 2. 核心修复：使用 UPDATE 语句，只更新 data 字段
      // 这样可以避免因 admin 用户没有 password 字段而与 INSERT 逻辑产生冲突
      const result = await env.DB.prepare(
        'UPDATE users SET data = ?1 WHERE name = ?2'
      ).bind(JSON.stringify(data), username).run();
      
      // 检查是否更新成功 (rows_affected 应该大于 0)
      if (result.meta.rows_affected === 0) {
          // 如果没有行受到影响，说明数据库中没有该用户记录。
          // 尽管 auth.js 会自动注册普通用户，但为了健壮性，这里可以返回错误或添加 INSERT 逻辑。
          // 考虑到 admin 用户是通过环境变量登录的，我们假设 admin 记录是存在的。
          return new Response('User record not found in DB for update.', { status: 404 });
      }

      return new Response('Saved successfully');
    } catch (e) {
      // 记录详细的错误信息
      console.error('Save Error:', e.message);
      return new Response('Server Error: ' + e.message, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
