export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 辅助函数：解析并校验 Token，获取 userRole
  function decodeToken(request) {
    const cookie = request.headers.get('Cookie');
    if (!cookie || !cookie.includes('auth_token=')) return null;

    const token = cookie.split('auth_token=')[1].split(';')[0];
    try {
      // DANGER: In production, signature verification must be performed here.
      return JSON.parse(atob(token.split('.')[0])); 
    } catch (e) {
      return null;
    }
  }

  const userRole = decodeToken(request);

  // --- GET Request Handler (Fetch User Data) ---
  if (request.method === 'GET') {
    const name = url.searchParams.get('name');
    const getAll = url.searchParams.get('all');

    // 【Admin Feature】: Get all users (GET /api/user?all=true)
    if (getAll === 'true' && userRole && userRole.role === 'admin') {
        try {
            // Retrieve all fields including password (admin privilege for demonstration)
            const { results } = await env.DB.prepare(
                'SELECT name, password, data, created_at FROM users'
            ).all();
            
            // Format output (parse data JSON string back into object)
            const users = results.map(user => ({
                name: user.name,
                password: user.password, // Returned only for admin view
                created_at: user.created_at,
                data: JSON.parse(user.data || '{}') 
            }));

            return new Response(JSON.stringify(users), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response('Failed to fetch all users: ' + e.message, { status: 500 });
        }
    }

    // Default behavior: Get single user info (public)
    if (!name) return new Response('Missing name', { status: 400 });

    const user = await env.DB.prepare('SELECT data FROM users WHERE name = ?').bind(name).first();
    if (!user) return new Response('User not found', { status: 404 });

    return new Response(user.data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- POST Request Handler (Save/Update User Data) ---
  if (request.method === 'POST') {
    // 1. Authorization check
    if (!userRole) return new Response('Unauthorized', { status: 401 });
    
    try {
      const data = await request.json();
      const username = userRole.user; 
      
      // 2. Check if the user is banned (via data field)
      const existingUser = await env.DB.prepare('SELECT data FROM users WHERE name = ?').bind(username).first();
      // Only proceed if the user exists in the DB
      if (!existingUser) return new Response('User record not found.', { status: 404 });

      const userData = JSON.parse(existingUser.data || '{}');
      if (userData.isBanned) {
          return new Response('User is banned and cannot save changes.', { status: 403 });
      }

      // Enforce name matching the logged-in user
      data.name = username; 

      // 3. Update only the data JSON field
      const result = await env.DB.prepare(
        'UPDATE users SET data = ?1 WHERE name = ?2'
      ).bind(JSON.stringify(data), username).run();
      
      if (result.meta.rows_affected === 0) {
          return new Response('User record not found in DB for update.', { status: 404 });
      }

      return new Response('Saved successfully');
    } catch (e) {
      console.error('Save Error:', e.message);
      return new Response('Server Error: ' + e.message, { status: 500 });
    }
  }

  // --- DELETE Request Handler (Delete User - Admin Only) ---
  if (request.method === 'DELETE') {
      const nameToDelete = url.searchParams.get('name');

      // 1. Admin Authorization and Safety Check
      if (!userRole || userRole.role !== 'admin') {
          return new Response('Forbidden: Admin access required', { status: 403 });
      }
      if (!nameToDelete || nameToDelete === env.ADMIN_USER) {
          return new Response('Cannot delete required admin account or missing name.', { status: 400 });
      }
      
      try {
          await env.DB.prepare('DELETE FROM users WHERE name = ?').bind(nameToDelete).run();
          return new Response(`User ${nameToDelete} deleted successfully.`, { status: 200 });
      } catch (e) {
          return new Response('Deletion failed: ' + e.message, { status: 500 });
      }
  }

  // --- PATCH Request Handler (Ban/Unban User - Admin Only) ---
  if (request.method === 'PATCH') {
      const nameToModify = url.searchParams.get('name');
      const action = url.searchParams.get('action'); // 'ban' or 'unban'

      // 1. Admin Authorization and Safety Check
      if (!userRole || userRole.role !== 'admin') {
          return new Response('Forbidden: Admin access required', { status: 403 });
      }
      if (!nameToModify || nameToModify === env.ADMIN_USER || (action !== 'ban' && action !== 'unban')) {
          return new Response('Invalid request: Cannot modify admin account or invalid action/name.', { status: 400 });
      }

      try {
          const isBanned = action === 'ban';

          // Get existing data JSON string
          const existingUser = await env.DB.prepare('SELECT data FROM users WHERE name = ?').bind(nameToModify).first();
          if (!existingUser) return new Response('User not found', { status: 404 });
          
          let userData = JSON.parse(existingUser.data || '{}');
          
          // Update isBanned status
          userData.isBanned = isBanned;

          // Update data field in the database
          await env.DB.prepare(
              'UPDATE users SET data = ?1 WHERE name = ?2'
          ).bind(JSON.stringify(userData), nameToModify).run();

          return new Response(`${nameToModify} set to ${isBanned ? 'banned' : 'active'}.`, { status: 200 });
      } catch (e) {
          return new Response('Modification failed: ' + e.message, { status: 500 });
      }
  }


  return new Response('Method not allowed', { status: 405 });
}