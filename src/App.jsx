import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  // 基础操作
  User, Edit2, Save, LogOut, Shield, Trash2, Ban, ExternalLink, 
  Loader2, Camera, Lock, Image as ImageIcon, Plus, Search, X, Check, Eye, EyeOff,
  // 排版与设置
  Type, Minus, AlignLeft, AlignCenter, AlignRight, Settings, GripVertical, Palette,
  // 社交与品牌
  Github, Twitter, Mail, Linkedin, Facebook, Instagram, Youtube, Twitch, 
  Dribbble, Figma, Chrome, Disc, Slack, MessageCircle, Send, 
  // 常用工具
  Link as LinkIcon, Globe, Home, MapPin, Phone, Smartphone, Calendar, 
  Briefcase, Coffee, Music, Video, Film, Headphones, Mic, 
  // 技术
  Code, Terminal, Cpu, Database, Cloud, Server, Laptop, Monitor,
  // 生活
  Heart, Star, Award, Zap, Activity, Book, Gift, ShoppingBag, 
  CreditCard, Wallet, Plane, Rocket
} from 'lucide-react';

/**
 * 核心配置 (Core Configuration)
 */
const MAX_IMAGE_SIZE = 500;
const IMAGE_QUALITY = 0.7;

// 图标库映射 (Icon Map)
const ICON_MAP = {
  github: Github, twitter: Twitter, email: Mail, linkedin: Linkedin, 
  facebook: Facebook, instagram: Instagram, youtube: Youtube, twitch: Twitch,
  dribbble: Dribbble, figma: Figma, website: Chrome, discord: Disc,
  slack: Slack, telegram: Send, wechat: MessageCircle,
  link: LinkIcon, globe: Globe, home: Home, location: MapPin, 
  phone: Phone, mobile: Smartphone, calendar: Calendar, work: Briefcase,
  coffee: Coffee, music: Music, video: Video, film: Film,
  audio: Headphones, mic: Mic, code: Code, terminal: Terminal,
  cpu: Cpu, database: Database, cloud: Cloud, server: Server,
  laptop: Laptop, monitor: Monitor, heart: Heart, star: Star,
  award: Award, zap: Zap, activity: Activity, book: Book,
  gift: Gift, shop: ShoppingBag, card: CreditCard, wallet: Wallet,
  camera: Camera, travel: Plane, rocket: Rocket
};

const THEMES = {
  blue: { name: '海盐蓝', class: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  cyan: { name: '薄荷青', class: 'bg-gradient-to-br from-cyan-300 to-blue-400' },
  purple: { name: '香芋紫', class: 'bg-gradient-to-br from-purple-300 to-purple-500' },
  pink: { name: '樱花粉', class: 'bg-gradient-to-br from-pink-300 to-rose-400' },
  orange: { name: '奶油橘', class: 'bg-gradient-to-br from-orange-300 to-red-400' },
  green: { name: '抹茶绿', class: 'bg-gradient-to-br from-emerald-300 to-emerald-500' },
  gray: { name: '云雾灰', class: 'bg-gradient-to-br from-gray-300 to-gray-500' },
  slate: { name: '极简白', class: 'bg-gradient-to-br from-slate-100 to-slate-300 border-b' },
};

const RADIUS_OPTIONS = {
  none: 'rounded-none',
  sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', xl: 'rounded-3xl',
  '2xl': 'rounded-[2rem]', '3xl': 'rounded-[2.5rem]', full: 'rounded-full',
};

// 默认空白用户模板 (Default User Template)
const DEFAULT_USER = {
  name: 'New User',
  displayTitle: 'Web Card', // New field for customizable main title
  avatar: '', 
  bgImage: null,
  customColor: null,
  bio: '这里是简介...',
  isBanned: false, // New field
  config: { cardRadius: '3xl', avatarRadius: 'full', linkRadius: 'xl' },
  links: [],
  theme: 'blue'
};

// 图片压缩工具 (Image Compression Utility)
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_IMAGE_SIZE) { height *= MAX_IMAGE_SIZE / width; width = MAX_IMAGE_SIZE; }
        } else {
          if (height > MAX_IMAGE_SIZE) { width *= MAX_IMAGE_SIZE / height; height = MAX_IMAGE_SIZE; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- 组件 (Components) ---

// Button Component
const Button = ({ children, onClick, variant = 'primary', className = '', loading = false, icon: Icon, ...props }) => {
  const baseStyle = "px-3 py-1.5 rounded-lg font-normal transition-all duration-200 flex items-center gap-2 disabled:opacity-50 justify-center text-sm";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700",
    icon: "p-2 aspect-square rounded-full hover:bg-black/10 text-gray-600"
  };
  return (
    <button onClick={onClick} disabled={loading} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// Input Component (simplified for brevity)
const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="mb-4">
    <label className="block text-sm font-normal text-gray-600 mb-1">{label}</label>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-normal" placeholder={placeholder} />
  </div>
);

// RadiusSlider Component (omitted for brevity)
const RadiusSlider = ({ label, value, onChange }) => {
  const options = Object.keys(RADIUS_OPTIONS);
  const safeIndex = Math.max(0, options.indexOf(value || 'md'));
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between text-xs text-gray-500 font-normal"><span>{label}</span></div>
      <div className="relative flex items-center h-4 w-full">
        <div className="absolute w-full h-1.5 bg-gray-100 rounded-full"></div>
        <input type="range" min="0" max={options.length - 1} value={safeIndex} onChange={(e) => onChange(options[e.target.value])} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
        <div className="absolute h-3.5 w-3.5 bg-blue-500 rounded-full shadow-sm pointer-events-none transition-all duration-150" style={{ left: `${(safeIndex / (options.length - 1)) * 100}%`, transform: 'translateX(-50%)' }} />
      </div>
    </div>
  );
};

// IconPicker Component (omitted for brevity)
const IconPicker = ({ value, onChange, onClose }) => {
  const [search, setSearch] = useState('');
  const filteredIcons = Object.keys(ICON_MAP).filter(key => key.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex gap-2 items-center">
          <Search className="w-4 h-4 text-gray-400" /><input className="flex-1 outline-none text-sm font-normal" placeholder="搜索图标..." value={search} onChange={e => setSearch(e.target.value)} autoFocus /><button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-2">
          {filteredIcons.map(key => {
            const IconComp = ICON_MAP[key];
            return <button key={key} onClick={() => onChange(key)} className={`aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-blue-50 transition-colors ${value === key ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}><IconComp className="w-5 h-5" /><span className="text-[10px] mt-1 truncate w-full text-center px-1 opacity-60 font-normal">{key}</span></button>;
          })}
        </div>
      </div>
    </div>
  );
};

// LoginModal Component (omitted for brevity)
const LoginModal = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleLogin = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          props.onLogin(data.user);
        } else {
          setError(data.error || '登录失败：用户名或密码错误');
        }
      } catch (e) {
        setError('网络错误');
      }
      setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Lock className="w-6 h-6" /></div>
              <h2 className="text-xl font-normal text-gray-900">登录 / 注册</h2>
              <p className="text-gray-500 mt-2 text-sm font-normal">如果账号不存在将自动注册</p>
            </div>
            <Input label="用户名" value={username} onChange={setUsername} placeholder="输入用户名" />
            <Input label="密码" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}
            <Button onClick={handleLogin} loading={loading} className="w-full mt-6">进入主页</Button>
            <Button onClick={props.onClose} variant="ghost" className="w-full mt-2">取消</Button>
          </div>
        </div>
      );
};


// ----------------------------------------------------
// Admin Dashboard Component
// ----------------------------------------------------
const AdminDashboard = ({ users, fetchUsers, adminName }) => {
    const [showPassword, setShowPassword] = useState(null); // Tracks which user's password to show
    
    // Action API Wrapper
    const sendAdminAction = async (name, method, action = null) => {
        if (name === adminName) {
            alert("不能对管理员账号执行此操作！");
            return;
        }
        
        let url = `/api/user?name=${name}`;
        if (action) url += `&action=${action}`;

        try {
            const response = await fetch(url, { method: method });
            if (response.ok) {
                alert(`${name} 操作成功: ${action || method}!`);
                fetchUsers();
            } else {
                alert(`操作失败: ${await response.text()}`);
            }
        } catch (e) {
            alert(`网络错误: ${e.message}`);
        }
    };

    const handleDelete = (name) => {
        if (confirm(`警告：您确定要永久删除用户 ${name} 吗? 此操作不可逆!`)) {
            sendAdminAction(name, 'DELETE');
        }
    };

    const handleBanUnban = (user) => {
        const action = user.data.isBanned ? 'unban' : 'ban';
        if (confirm(`确定要${action === 'ban' ? '禁用' : '启用'}用户 ${user.name} 吗?`)) {
            sendAdminAction(user.name, 'PATCH', action);
        }
    };
    
    // Sort logic to put Admin account first
    const sortedUsers = useMemo(() => {
        const sorted = [...users];
        sorted.sort((a, b) => {
            if (a.name === adminName) return -1;
            if (b.name === adminName) return 1;
            return 0;
        });
        return sorted;
    }, [users, adminName]);

    // Admin UI style
    return (
        <div className="max-w-7xl mx-auto w-full bg-white p-6 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">管理中心</h2>
            <p className="text-sm text-gray-500 mb-4">当前注册用户总数：{users.length}</p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">密码 (演示)</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedUsers.map((user) => (
                            <tr key={user.name} className={user.name === adminName ? 'bg-indigo-50 font-semibold' : user.data.isBanned ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}>
                                {/* User Name */}
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                    {user.name}
                                    {user.name === adminName && <span className="text-xs text-indigo-600 font-bold ml-2">(ADMIN)</span>}
                                </td>
                                {/* Status */}
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                    {user.data.isBanned ? <span className="text-red-500 flex items-center gap-1"><Ban className="w-4 h-4" />已禁用</span> : <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4" />正常</span>}
                                </td>
                                {/* Password (Sensitive) */}
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-mono">
                                    {user.name === adminName ? '********' : (
                                        <div className="flex items-center gap-2">
                                            <span>{showPassword === user.name ? user.password : '********'}</span>
                                            <button onClick={() => setShowPassword(showPassword === user.name ? null : user.name)} className="text-gray-500 hover:text-gray-900">
                                                {showPassword === user.name ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}
                                </td>
                                {/* Created At */}
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                {/* Actions */}
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    {user.name !== adminName && (
                                        <>
                                            <Button 
                                                variant={user.data.isBanned ? 'primary' : 'secondary'} 
                                                onClick={() => handleBanUnban(user)} 
                                                className="w-16"
                                            >
                                                {user.data.isBanned ? '启用' : '禁用'}
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                icon={Trash2} 
                                                onClick={() => handleDelete(user.name)}
                                                className="hover:text-red-600 !p-1.5"
                                            >
                                                删
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main App ---
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [viewUser, setViewUser] = null; 
  const [isEditing, setIsEditing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);
  const [pickingIconIndex, setPickingIconIndex] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const avatarInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // View state: 'card' (default) | 'admin' (admin dashboard)
  const [view, setView] = useState('card'); 
  const [allUsers, setAllUsers] = useState([]); 

  // Check if current user is admin
  const isAdmin = useMemo(() => currentUser && currentUser.role === 'admin', [currentUser]);
  const adminName = 'admin'; // Assumed admin username

  // Function to fetch all users (Admin only)
  const fetchAllUsers = useCallback(async () => {
      if (!isAdmin) return;
      setLoadingData(true); 
      try {
          const response = await fetch('/api/user?all=true');
          if (response.ok) {
              const users = await response.json();
              setAllUsers(users);
          } else {
              console.error('Failed to fetch all users:', await response.text());
          }
      } catch (error) {
          console.error('Error fetching all users:', error);
      } finally {
          setLoadingData(false);
      }
  }, [isAdmin]);

  // Initialization: Check for current user and fetch data
  useEffect(() => {
    // 1. Get path, remove leading/trailing slash
    let path = window.location.pathname.replace(/^\/|\/$/g, ''); 
    
    // 2. Safely extract the last segment as the intended username
    const segments = path.split('/');
    const username = segments.pop() || adminName; 
    
    // 3. Session Check: Check if auth_token cookie exists to set user status
    const cookieMatch = document.cookie.match(/auth_token=([^;]+)/);
    if (cookieMatch) {
      try {
        const tokenPayload = atob(cookieMatch[1].split('.')[0]);
        const user = JSON.parse(tokenPayload);
        setCurrentUser(user);
      } catch (e) {
        console.error("Invalid token found:", e);
        // If token is invalid, attempt to clear it.
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }
    
    fetchUser(username);
  }, []);

  // Fetch all users when admin logs in or switches to admin view
  useEffect(() => {
      if (isAdmin && view === 'admin') {
          fetchAllUsers();
      }
  }, [isAdmin, view, fetchAllUsers]);


  const fetchUser = async (username) => {
    setLoadingData(true);
    try {
      const res = await fetch(`/api/user?name=${username}`);
      if (res.ok) {
        const data = await res.json();
        setViewUser(data);
      } else {
        setViewUser(DEFAULT_USER);
      }
    } catch (e) {
      console.error(e);
      setViewUser(DEFAULT_USER);
    }
    setLoadingData(false);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowLogin(false);
    // Navigate to the user's home page
    window.history.pushState({}, '', `/${user.name}`);
    fetchUser(user.name);
  };

  const handleLogout = () => {
    // 1. Clear frontend state
    setCurrentUser(null);
    setIsEditing(false);
    setView('card');
    
    // 2. Clear Cookie 
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // 3. Redirect to home/default view
    window.location.pathname = '/'; 
  };


  const handleSave = async () => {
    if (!tempProfile) return;
    
    // Check for banned status before saving
    if (viewUser && viewUser.isBanned) {
        alert("账户已被禁用，无法保存更改。");
        return;
    }
    
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempProfile)
      });
      if (res.ok) {
        setViewUser({ ...tempProfile });
        setIsEditing(false);
        alert('保存成功！');
      } else {
        alert('保存失败，请重试');
      }
    } catch (e) {
      alert('网络错误');
    }
  };

  // State update helper functions
  const updateProfile = (key, value) => setTempProfile(prev => ({ ...prev, [key]: value }));
  const updateConfig = (key, value) => setTempProfile(prev => ({ ...prev, config: { ...(prev.config || {}), [key]: value } }));
  const addLinkItem = (type) => {
    let newItem = type === 'header' ? { type: 'header', title: '新标题', align: 'left' } : 
                  type === 'divider' ? { type: 'divider' } : 
                  { type: 'link', url: '', title: '新链接' };
    updateProfile('links', [...tempProfile.links, newItem]);
  };
  const updateLink = (index, field, value) => {
    const newLinks = [...tempProfile.links]; newLinks[index] = { ...newLinks[index], [field]: value };
    updateProfile('links', newLinks);
  };
  const removeLink = (index) => { updateProfile('links', tempProfile.links.filter((_, i) => i !== index)); };
  
  // Drag and Drop Logic (Touch and Mouse)
  const handleDragStart = (e, idx) => {
    dragItem.current = idx;
    e.target.style.opacity = '0.5';
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target);
    }
  };
  const handleDragEnter = (e, idx) => {
    dragOverItem.current = idx;
  };
  const handleDragEnd = (e) => {
    handleSort();
    if (e.target) e.target.style.opacity = '1';
  };
  
  const handleTouchStart = (e, idx) => {
      e.preventDefault(); 
      dragItem.current = idx;
      e.currentTarget.style.opacity = '0.5';
  };

  const handleTouchMove = (e) => {
      // Find the element currently under the touch point
      const touch = e.touches[0];
      const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (targetElement) {
        // Find the closest draggable item element
        const itemElement = targetElement.closest('[data-drag-index]');
        if (itemElement) {
          const newIdx = parseInt(itemElement.dataset.dragIndex);
          if (dragOverItem.current !== newIdx) {
            dragOverItem.current = newIdx;
          }
        }
      }
  };

  const handleTouchEnd = (e) => {
      if (dragItem.current !== null && dragOverItem.current !== null) {
          handleSort();
      }
      e.currentTarget.style.opacity = '1';
      dragItem.current = null;
      dragOverItem.current = null;
  };

  const handleSort = () => {
    const _links = [...tempProfile.links];
    if (dragOverItem.current === null || dragItem.current === dragOverItem.current) return;

    const draggedItemContent = _links.splice(dragItem.current, 1)[0];
    _links.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null; dragOverItem.current = null;
    updateProfile('links', _links);
  };

  const handleUpload = async (e, field) => {
    if (e.target.files[0]) {
      try { updateProfile(field, await compressImage(e.target.files[0])); } 
      catch (err) { alert("图片处理失败"); }
    }
  };

  const handleCustomColor = (e) => setTempProfile(prev => ({ ...prev, theme: 'custom', customColor: e.target.value, bgImage: null }));

  // Check if current user is banned (to disable editing/saving)
  const isCurrentUserBanned = viewUser && viewUser.isBanned && viewUser.name === currentUser?.name;


  if (loadingData && view !== 'admin') return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (!viewUser && !loadingData && view === 'card') return <div className="min-h-screen flex items-center justify-center text-gray-400">用户数据加载失败或用户不存在</div>;


  const displayData = isEditing && tempProfile ? tempProfile : viewUser;
  const config = displayData?.config || DEFAULT_USER.config;
  const getBackgroundStyle = () => {
    if (displayData.bgImage) return { backgroundImage: `url(${displayData.bgImage})` };
    if (displayData.theme === 'custom' && displayData.customColor) return { background: displayData.customColor };
    return {};
  };
  const currentTheme = THEMES[displayData.theme];
  const bgClassName = !displayData.bgImage && displayData.theme !== 'custom' ? (currentTheme?.class || THEMES.blue.class) : '';
  const renderIcon = (type) => { const IconComp = ICON_MAP[type] || LinkIcon; return <IconComp className="w-5 h-5" />; };

  return (
    <div className="min-h-screen bg-[#EAF3F7] flex flex-col items-center justify-center p-4 font-sans text-gray-900 transition-colors duration-500">
      <nav className="fixed top-0 left-0 right-0 p-3 sm:p-4 flex justify-end items-center z-40">
        
        {/* UI Replaced: Simplified Navigation Bar */}
        <div className="pointer-events-auto flex gap-2 sm:gap-3 bg-white/70 backdrop-blur rounded-full shadow-lg p-1.5 border border-gray-100">
          {currentUser ? (
            <>
              {/* Admin Switch Button (管理) */}
              {isAdmin && (
                  <Button 
                      variant={view === 'card' ? "primary" : "ghost"}
                      icon={Shield} 
                      onClick={() => setView(view === 'card' ? 'admin' : 'card')}
                      title="管理中心"
                      className="!p-2 aspect-square" // Make button square for mobile
                  >
                     {view === 'card' ? '管理' : ''}
                  </Button>
              )}

              {/* Edit/Save Button (only for current user and in card view, UNLESS BANNED) */}
              {currentUser.name === viewUser?.name && view === 'card' && (
                <Button 
                  // Disable editing/saving if user is banned
                  disabled={isCurrentUserBanned}
                  variant={isEditing ? "primary" : "secondary"} 
                  icon={isEditing ? Save : Edit2} 
                  onClick={() => { if (isEditing) handleSave(); else { setTempProfile({ ...viewUser }); setIsEditing(true); } }}
                  title={isEditing ? '保存' : '编辑'}
                  className="!p-2 aspect-square sm:!px-4"
                >
                  <span className="hidden sm:inline">{isEditing ? '保存' : '编辑'}</span>
                </Button>
              )}
              {/* Logout Button */}
              <Button variant="ghost" icon={LogOut} className="!p-2 aspect-square" onClick={handleLogout} title="退出" />
            </>
          ) : (
            <Button variant="primary" onClick={() => setShowLogin(true)} className="!px-4">登录</Button>
          )}
        </div>
      </nav>

      <main className="w-full max-w-xl relative pb-10 mt-16 sm:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Render Card View */}
        {view === 'card' && (
           <div className="w-full max-w-md mx-auto relative">
              <div className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 transform ${RADIUS_OPTIONS[config.cardRadius] || 'rounded-[2.5rem]'}`}>
                <div className={`h-36 relative transition-all duration-500 bg-cover bg-center ${bgClassName}`} style={getBackgroundStyle()}>
                  {isEditing && !isCurrentUserBanned && (
                    <div className="absolute top-2 right-2 z-20">
                      <button onClick={() => bgInputRef.current?.click()} className={`px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-gray-700 shadow-lg flex items-center gap-1.5 hover:bg-white transition-all ${displayData.bgImage ? 'ring-2 ring-blue-500' : ''}`}><ImageIcon className="w-3 h-3" />更换背景</button>
                      <input type="file" ref={bgInputRef} className="absolute opacity-0 pointer-events-none" accept="image/*" onChange={(e) => handleUpload(e, 'bgImage')} />
                    </div>
                  )}
                </div>

                <div className="px-8 pb-8">
                  <div className="relative -mt-16 mb-6 flex justify-between items-end">
                    <div className="relative group">
                      <div className={`w-28 h-28 border-[4px] border-white shadow-lg bg-white overflow-hidden relative ${RADIUS_OPTIONS[config.avatarRadius] || 'rounded-full'}`}><img src={displayData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=new'} className="w-full h-full object-cover" alt="Avatar"/>{isEditing && !isCurrentUserBanned && <div onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Camera className="w-8 h-8 text-white/90" /></div>}</div>
                      <input type="file" ref={avatarInputRef} className="absolute opacity-0 pointer-events-none" accept="image/*" onChange={(e) => handleUpload(e, 'avatar')} />
                    </div>
                  </div>

                  <div className="text-left mb-8 space-y-2">
                    {isEditing && !isCurrentUserBanned ? (
                      <>
                        {/* Editable displayTitle */}
                        <input className="text-2xl font-normal w-full border-b border-transparent hover:border-blue-100 focus:border-blue-500 outline-none bg-transparent transition-colors px-1 -ml-1 rounded" value={displayData.displayTitle || displayData.name} onChange={(e) => updateProfile('displayTitle', e.target.value)} placeholder="你的自定义标题" />
                        <textarea className="text-gray-500 font-normal w-full border border-transparent hover:border-blue-100 focus:border-blue-500 rounded-lg outline-none resize-none bg-transparent -ml-2 px-2 py-1 text-sm leading-relaxed" rows="2" value={displayData.bio} onChange={(e) => updateProfile('bio', e.target.value)} placeholder="一句话介绍自己..." />
                      </>
                    ) : (
                      <>
                        <h1 className="text-2xl font-normal text-gray-900">{displayData.displayTitle || displayData.name}</h1>
                        <p className="text-gray-500 font-normal text-sm leading-relaxed whitespace-pre-wrap">{displayData.bio}</p>
                      </>
                    )}
                     {displayData.isBanned && <p className="text-xs text-red-500 font-medium mt-2">此账户已被禁用，无法保存更改。</p>}
                  </div>

                  <div className="space-y-3">
                    {displayData.links.map((item, idx) => {
                      // Drag/Drop and Touch Events for Mobile Dragging
                      const dragProps = isEditing && !isCurrentUserBanned ? { 
                        draggable: true, 
                        onDragStart: (e) => handleDragStart(e, idx), 
                        onDragEnter: (e) => handleDragEnter(e, idx), 
                        onDragEnd: handleDragEnd, 
                        onDragOver: (e) => e.preventDefault(),
                        onTouchStart: (e) => handleTouchStart(e, idx),
                        onTouchMove: handleTouchMove,
                        onTouchEnd: handleTouchEnd,
                        'data-drag-index': idx
                      } : {};

                      if (item.type === 'divider') return isEditing && !isCurrentUserBanned ? <div key={idx} {...dragProps} className="group relative py-3 flex items-center justify-center cursor-move hover:bg-gray-50 rounded-lg transition-colors"><GripVertical className="absolute left-2 text-gray-300 w-4 h-4 opacity-0 group-hover:opacity-100" /><div className="w-full border-t border-dashed border-gray-300 mx-8" /><button onClick={() => removeLink(idx)} className="absolute right-2 p-1 text-red-400 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button><span className="absolute bg-white px-2 text-[10px] text-gray-400 font-normal">分割线</span></div> : <div key={idx} className="py-2"><div className="border-t border-gray-100" /></div>;
                      if (item.type === 'header') { const textAlign = item.align === 'center' ? 'text-center' : item.align === 'right' ? 'text-right' : 'text-left'; return isEditing && !isCurrentUserBanned ? <div key={idx} {...dragProps} className="group relative flex items-center gap-2 p-1 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-move"><GripVertical className="text-gray-300 w-4 h-4 opacity-0 group-hover:opacity-100" /><div className="flex gap-1 bg-gray-50 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => updateLink(idx, 'align', 'left')} className="p-1 rounded hover:bg-white"><AlignLeft className="w-3 h-3" /></button><button onClick={() => updateLink(idx, 'align', 'center')} className="p-1 rounded hover:bg-white"><AlignCenter className="w-3 h-3" /></button><button onClick={() => updateLink(idx, 'align', 'right')} className="p-1 rounded hover:bg-white"><AlignRight className="w-3 h-3" /></button></div><input className={`flex-1 font-normal text-gray-500 text-sm bg-transparent outline-none ${textAlign}`} value={item.title} onChange={(e) => updateLink(idx, 'title', e.target.value)} /><button onClick={() => removeLink(idx)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button></div> : <h3 key={idx} className={`font-normal text-gray-500 text-sm mt-6 mb-2 ${textAlign}`}>{item.title}</h3>; }
                      return (
                        <div key={idx} {...dragProps} className="relative group/item">
                          {isEditing && !isCurrentUserBanned ? (
                            <div className={`flex items-center p-2 bg-white border border-gray-200 shadow-sm transition-all cursor-move hover:shadow-md ${RADIUS_OPTIONS[config.linkRadius]}`}>
                              <div className="mr-2 cursor-move text-gray-300 hover:text-gray-500"><GripVertical className="w-4 h-4" /></div>
                              <button onClick={() => setPickingIconIndex(idx)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors mr-3">{renderIcon(item.type)}</button>
                              <div className="flex-1 min-w-0 flex flex-col justify-center"><input className="font-normal text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400" value={item.title} onChange={(e) => updateLink(idx, 'title', e.target.value)} placeholder="链接标题" /><input className="text-xs text-gray-400 outline-none bg-transparent placeholder-gray-300 mt-0.5 font-normal" value={item.url} onChange={(e) => updateLink(idx, 'url', e.target.value)} placeholder="https://example.com" /></div>
                              <button onClick={() => removeLink(idx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <a href={item.url} target="_blank" rel="noreferrer" className={`flex items-center p-2 bg-gray-50 hover:bg-white hover:shadow-md hover:scale-[1.01] border border-transparent hover:border-gray-100 transition-all duration-300 group ${RADIUS_OPTIONS[config.linkRadius]}`}>
                              <div className={`p-2 rounded-lg bg-white shadow-sm text-gray-600 group-hover:text-blue-600 transition-colors`}>{renderIcon(item.type)}</div>
                              <span className="ml-3 font-normal text-gray-800 text-sm flex-1">{item.title}</span>
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                    {isEditing && !isCurrentUserBanned && (
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        <button className="py-3 border border-dashed border-gray-300 hover:border-blue-400 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-1.5 font-normal text-xs" onClick={() => addLinkItem('link')}><Plus className="w-4 h-4" />加链接</button>
                        <button className="py-3 border border-dashed border-gray-300 hover:border-purple-400 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center gap-1.5 font-normal text-xs" onClick={() => addLinkItem('header')}><Type className="w-4 h-4" />加标题</button>
                        <button className="py-3 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-1.5 font-normal text-xs" onClick={() => addLinkItem('divider')}><Minus className="w-4 h-4" />加分割线</button>
                      </div>
                    )}
                  </div>

                  {isEditing && !isCurrentUserBanned && (
                    <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-4">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-gray-800 font-normal text-sm"><Palette className="w-4 h-4" /><span>主题色调</span></div>
                            <button onClick={() => colorInputRef.current?.click()} className="text-xs text-blue-600 font-normal hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" /> 自定义颜色</button>
                            <input type="color" ref={colorInputRef} className="absolute opacity-0 pointer-events-none" value={displayData.customColor || '#000000'} onChange={handleCustomColor} />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(THEMES).map(([key, theme]) => (
                              <button key={key} onClick={() => { updateProfile('theme', key); updateProfile('bgImage', null); updateProfile('customColor', null); }} className={`w-8 h-8 rounded-full ${theme.class} relative transition-all duration-200 shadow-sm hover:scale-110 ${displayData.theme === key && !displayData.bgImage && !displayData.customColor ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'ring-1 ring-black/5 hover:ring-black/10'}`} title={theme.name}>{displayData.theme === key && !displayData.bgImage && !displayData.customColor && <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" strokeWidth={3} />}</button>
                            ))}
                            {displayData.customColor && <button onClick={() => colorInputRef.current?.click()} className={`w-8 h-8 rounded-full relative transition-all duration-200 shadow-sm ring-2 ring-offset-2 ring-blue-500 scale-110`} style={{ background: displayData.customColor }} title="自定义颜色"><Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" strokeWidth={3} /></button>}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-gray-800 font-normal text-sm"><Settings className="w-4 h-4" /><span>圆角风格</span></div>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                          <RadiusSlider label="卡片外框" value={config.cardRadius} onChange={v => updateConfig('cardRadius', v)} />
                          <RadiusSlider label="头像形状" value={config.avatarRadius} onChange={v => updateConfig('avatarRadius', v)} />
                          <RadiusSlider label="链接卡片" value={config.linkRadius} onChange={v => updateConfig('linkRadius', v)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 text-center text-gray-400 text-xs font-normal"><p>© 2025 Web Card. Optimized for D1.</p></div>
           </div>
        )}

        {/* Render Admin Dashboard */}
        {view === 'admin' && isAdmin && (
            <AdminDashboard users={allUsers} fetchUsers={fetchAllUsers} adminName={adminName} />
        )}

      </main>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      {pickingIconIndex !== null && <IconPicker value={tempProfile.links[pickingIconIndex].type} onClose={() => setPickingIconIndex(null)} onChange={(newIcon) => { updateLink(pickingIconIndex, 'type', newIcon); setPickingIconIndex(null); }} />}
    </div>
  );
}

// Default Export
export default App;
