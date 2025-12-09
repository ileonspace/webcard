export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 辅助函数：解析并校验 Token，获取 userRole
  function decodeToken(request) {
    const cookie = request.headers.get('Cookie');
    if (!cookie || !cookie.includes('auth_token=')) return null;

    const token = cookie.split('auth_token=')[1].split(';')[0];
    try {
      // 危险：生产环境请校验签名
      return JSON.parse(atob(token.split('.')[0])); 
    } catch (e) {
      return null;
    }
  }

  // GET 请求处理
  if (request.method === 'GET') {
    const name = url.searchParams.get('name');
    const getAll = url.searchParams.get('all');
    const userRole = decodeToken(request);

    // 【新增功能】: 管理员获取所有用户列表 (GET /api/user?all=true)
    if (getAll === 'true' && userRole && userRole.role === 'admin') {
        try {
            // 只选择 name, created_at, 和 data
            const { results } = await env.DB.prepare(
                'SELECT name, created_at, data FROM users'
            ).all();
            
            // 格式化输出 (将 data 从 JSON 字符串转回对象，以便前端处理)
            const users = results.map(user => ({
                name: user.name,
                created_at: user.created_at,
                data: JSON.parse(user.data) // 解析 JSON 字符串
            }));

            return new Response(JSON.stringify(users), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response('Failed to fetch all users: ' + e.message, { status: 500 });
        }
    }


    // 默认行为: 获取单个用户信息 (公开)
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
    const userRole = decodeToken(request);
    if (!userRole) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    try {
      const data = await request.json();
      
      // 强制覆盖 name 为当前登录用户，防止篡改他人数据
      const username = userRole.user; 
      data.name = username; 

      // 2. 【核心修复】：使用 UPDATE 语句，只更新 data 字段
      const result = await env.DB.prepare(
        'UPDATE users SET data = ?1 WHERE name = ?2'
      ).bind(JSON.stringify(data), username).run();
      
      // 检查是否更新成功 (rows_affected 应该大于 0)
      if (result.meta.rows_affected === 0) {
          return new Response('User record not found in DB for update.', { status: 404 });
      }

      return new Response('Saved successfully');
    } catch (e) {
      console.error('Save Error:', e.message);
      return new Response('Server Error: ' + e.message, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}