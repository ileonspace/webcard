export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();

    // 1. 管理员登录 (优先检查环境变量)
    if (body.username === env.ADMIN_USER && body.password === env.ADMIN_PASS) {
      // 生成管理员 Token (生产环境建议使用真正的签名算法)
      const token = btoa(JSON.stringify({ user: 'admin', role: 'admin' })) + '.sign';
      return jsonResp({ name: 'admin', role: 'admin' }, token);
    }

    // 2. 普通用户处理 (查询 D1 数据库)
    const user = await env.DB.prepare('SELECT * FROM users WHERE name = ?').bind(body.username).first();
    
    if (user) {
      // A. 用户存在：验证密码
      // 注意：这里为了演示使用的是明文比对。在生产环境中，请务必在存储前使用 bcrypt 等库对密码进行哈希处理。
      if (user.password === body.password) {
        const token = btoa(JSON.stringify({ user: user.name, role: 'user' })) + '.sign';
        return jsonResp({ name: user.name, role: 'user' }, token);
      } else {
        return new Response(JSON.stringify({ error: 'Invalid password' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // B. 用户不存在：自动注册
      // 初始化新用户的默认数据
      const initialData = JSON.stringify({ 
        // 保持 name 作为内部标识
        name: body.username, 
        // 【新增字段】用作用户卡片上的大标题，默认为注册名
        displayTitle: body.username, 
        links: [], 
        theme: 'blue',
        bio: 'Hello World!',
        config: { cardRadius: '3xl', avatarRadius: 'full', linkRadius: 'xl' }
      });

      // 插入新用户到数据库
      await env.DB.prepare('INSERT INTO users (name, password, data) VALUES (?1, ?2, ?3)')
        .bind(body.username, body.password, initialData)
        .run();
        
      const token = btoa(JSON.stringify({ user: body.username, role: 'user' })) + '.sign';
      return jsonResp({ name: body.username, role: 'user' }, token);
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 辅助函数：生成统一的 JSON 响应并设置 Cookie
function jsonResp(data, token) {
  return new Response(JSON.stringify({ user: data }), {
    headers: {
      'Content-Type': 'application/json',
      // 设置 HttpOnly Cookie，确保安全
      'Set-Cookie': `auth_token=${token}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Lax`
    }
  });
}