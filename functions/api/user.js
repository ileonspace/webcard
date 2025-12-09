export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // GET: 获取用户信息 (公开)
  if (request.method === 'GET') {
    const name = url.searchParams.get('name');
    if (!name) return new Response('Missing name', { status: 400 });

    const user = await env.DB.prepare('SELECT data FROM users WHERE name = ?').bind(name).first();
    if (!user) return new Response('User not found', { status: 404 });

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
    const userRole = JSON.parse(atob(token.split('.')[0])); // 危险：生产环境请校验签名

    try {
      const data = await request.json();
      // 强制覆盖 name 为当前登录用户，防止篡改他人数据
      data.name = userRole.user; 

      await env.DB.prepare(
        'INSERT INTO users (name, data) VALUES (?1, ?2) ON CONFLICT(name) DO UPDATE SET data = ?2'
      ).bind(data.name, JSON.stringify(data)).run();

      return new Response('Saved');
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}