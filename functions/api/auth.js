export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();

    // --- 1. 管理员登录 (优先检查环境变量) ---
    if (body.username === env.ADMIN_USER && body.password === env.ADMIN_PASS) {
      const token = btoa(JSON.stringify({ user: 'admin', role: 'admin' })) + '.sign';
      return jsonResp({ name: 'admin', role: 'admin' }, token);
    }

    // --- 2. 普通用户处理 (查询 D1 数据库) ---
    const user = await env.DB.prepare('SELECT * FROM users WHERE name = ?').bind(body.username).first();
    
    if (user) {
      // 检查 data 字段，确保其存在且是 JSON
      const userData = JSON.parse(user.data || '{}');

      // 【新增检查】：用户是否被禁用
      if (userData.isBanned) {
        return new Response(JSON.stringify({ error: 'Account has been banned.' }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // A. 用户存在：验证密码
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
      // 初始化新用户的默认数据：【新增 displayTitle 和 isBanned 字段】
      const initialData = JSON.stringify({ 
        name: body.username, 
        displayTitle: body.username,
        avatar: '', 
        bgImage: null,
        customColor: null,
        bio: '这里是简介...',
        isBanned: false, // 默认未禁用
        config: { cardRadius: '3xl', avatarRadius: 'full', linkRadius: 'xl' },
        links: [],
        theme: 'blue'
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
      'Set-Cookie': `auth_token=${token}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Lax`
    }
  });
}