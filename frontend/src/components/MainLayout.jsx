import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifMenu, setShowNotifMenu] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = React.useCallback(async () => {
    if (!user.id) return;
    try {
      const res = await fetch(`${apiEndpoints.getNotificationsList()}?user_id=${user.id}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (err) { console.error("Notif Fetch Error:", err); }
  }, [user.id]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notifId) => {
    try {
      await fetch(apiEndpoints.markNotificationRead(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notifId })
      });
      fetchNotifications();
    } catch (err) { }
  };

  const menuItems = [
    { id: 'home', label: 'หน้าแรก', icon: '🏠', path: '/dashboard' },
    { id: 'booking', label: 'ระบบจองคิว', icon: '📅', path: '/dashboard?view=booking', role: ['student'] },
    { id: 'usage-history', label: 'ประวัติการใช้งาน', icon: '📜', path: '/dashboard?view=history', role: ['student'] },
    { id: 'report-issue', label: 'แจ้งซ่อมเครื่องมือ', icon: '⚠️', path: '/dashboard?view=report', role: ['student'] },
    { id: 'approve-booking', label: 'อนุมัติการจอง', icon: '✅', path: '/approve-bookings', role: ['staff', 'admin'] },
    { id: 'equipment', label: 'จัดการเครื่องมือ', icon: '📦', path: '/equipment', role: ['admin', 'staff'] },
    { id: 'status', label: 'ติดตามสถานะ', icon: '📊', path: '/status-tracking', role: ['admin'] },
    { id: 'analytics', label: 'บทวิเคราะห์', icon: '📈', path: '/analytics', role: ['admin', 'ceo'] },
  ];
  
  const adminItems = [
    { id: 'admin-dash', label: 'Admin Dashboard', icon: '🔐', path: '/admin-dashboard' },
    { id: 'admin-users', label: 'จัดการผู้ใช้', icon: '👥', path: '/admin-users' },
    { id: 'admin-approvals', label: 'อนุมัติพนักงาน', icon: '✅', path: '/admin-approvals' },
    { id: 'admin-audit', label: 'Audit Logs', icon: '📋', path: '/admin-audit' },
  ];

  const ceoItems = [
    { id: 'ceo-dash', label: 'CEO Dashboard', icon: '📊', path: '/ceo-dashboard' },
    { id: 'ceo-trends', label: 'เทรนด์การใช้งาน', icon: '📈', path: '/ceo-trends' },
    { id: 'ceo-costs', label: 'วิเคราะห์ต้นทุน', icon: '💰', path: '/ceo-cost-analysis' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => {
    if (path.includes('?')) {
        return location.pathname + location.search === path;
    }
    return location.pathname === path && !location.search;
  };

  const renderNavItems = (items) => {
    return items
      .filter(item => !item.role || item.role.includes(user.role))
      .map(item => (
        <button
          key={item.id}
          onClick={() => {
            navigate(item.path);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
            isActive(item.path) ? 'font-black bg-brand-sand text-brand-charcoal shadow-sm' : 'font-bold text-stone-400 hover:text-brand-orange hover:bg-brand-orange/5'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-sm uppercase tracking-tight">{item.label}</span>
        </button>
      ));
  };

  return (
    <div className="flex min-h-screen font-sans text-gray-800 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fffaf5 0%, #f8f2eb 100%)' }}>
      
      {/* Mobile/Desktop Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-[60] lg:hidden transition-all duration-500"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-stone-100 shadow-2xl z-[70] flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-brand-charcoal text-white font-black text-xl">IS</div>
            <h1 className="text-xl font-black tracking-tighter text-brand-charcoal">Instrument</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-6 custom-scrollbar">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-brand-gold opacity-80">Main Directory</p>
          {renderNavItems(menuItems)}

          {user.role === 'admin' && (
            <>
              <div className="h-px bg-stone-100 my-6 mx-4 opacity-50"></div>
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-brand-orange">Administrator</p>
              {renderNavItems(adminItems)}
            </>
          )}

          {user.role === 'ceo' && (
            <>
              <div className="h-px bg-stone-100 my-6 mx-4 opacity-50"></div>
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-500">Executive Hub</p>
              {renderNavItems(ceoItems)}
            </>
          )}
        </nav>

        {/* Bottom Logout Section */}
        <div className="p-6 border-t border-stone-100 bg-stone-50/30">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-100 shadow-sm hover:border-red-200 hover:text-red-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-charcoal text-white flex items-center justify-center text-xs font-black group-hover:bg-red-600 transition-colors">
                {user.first_name?.[0] || 'U'}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-black truncate w-24">{user.first_name} {user.last_name}</p>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">ออกจากระบบ</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-300 group-hover:text-red-500 transition-colors">logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen overflow-y-auto px-6 md:px-12 py-10 lg:py-12 custom-scrollbar transition-all duration-500 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12 relative z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-white border border-stone-100 rounded-2xl shadow-xl shadow-stone-100 text-brand-charcoal hover:text-brand-orange transition-all active:scale-90"
            >
              <span className="material-symbols-outlined font-black">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
            </button>
            <div className="space-y-1">
              <h2 className="text-3xl lg:text-4xl font-black text-brand-charcoal tracking-tighter">{title}</h2>
              {subtitle && <p className="text-stone-400 font-bold text-xs lg:text-sm tracking-tight">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto relative">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
                className="p-3.5 bg-white border border-stone-100 rounded-2xl shadow-xl shadow-stone-100 text-stone-400 hover:text-brand-orange transition-all relative group"
              >
                <span className="material-symbols-outlined font-black group-hover:rotate-12 transition-transform">notifications</span>
                {unreadCount > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-orange border-2 border-white rounded-full"></span>}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <p className="font-black text-brand-charcoal uppercase text-[10px] tracking-widest">Notifications</p>
                    {unreadCount > 0 && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black">{unreadCount} NEW</span>}
                  </div>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-center py-10 text-stone-400 text-xs font-bold uppercase tracking-widest">No notifications</p>
                    ) : notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.is_read ? 'bg-white border-stone-50 text-stone-400' : 'bg-stone-50 border-stone-100 text-brand-charcoal shadow-sm'}`}
                      >
                        <p className={`text-xs font-black mb-1 ${n.is_read ? 'text-stone-400' : 'text-brand-charcoal'}`}>{n.title}</p>
                        <p className="text-[10px] leading-relaxed line-clamp-2">{n.message}</p>
                        <p className="text-[8px] mt-2 opacity-50 font-bold uppercase">{new Date(n.created_at).toLocaleDateString('th-TH')}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 text-brand-gold font-black text-[10px] uppercase tracking-widest border-t border-stone-100 hover:text-brand-orange transition-colors">See all alerts</button>
                </div>
              )}
            </div>

            {/* Profile Management */}
            <div className="relative">
              <button 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
                className="flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-2xl border border-stone-100 shadow-xl shadow-stone-100/50 hover:border-brand-sand transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-sand/30 text-brand-gold flex items-center justify-center font-black group-hover:bg-brand-gold group-hover:text-white transition-colors">
                  {user.first_name?.[0] || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Profile</p>
                  <p className="text-xs font-black text-brand-charcoal tracking-tight">ตั้งค่าบัญชี</p>
                </div>
                <span className={`material-symbols-outlined text-stone-300 text-sm ml-1 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 border-b border-stone-50 bg-stone-50/50">
                    <p className="text-xs font-black text-brand-charcoal">{user.first_name} {user.last_name}</p>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 group">
                      <span className="material-symbols-outlined text-lg group-hover:text-brand-gold">manage_accounts</span>
                      <span className="text-xs font-bold">ข้อมูลส่วนตัว</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 group">
                      <span className="material-symbols-outlined text-lg group-hover:text-brand-gold">settings</span>
                      <span className="text-xs font-bold">การตั้งค่า</span>
                    </button>
                    <div className="h-px bg-stone-50 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors group">
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span className="text-xs font-black uppercase">ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
