import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, User, LayoutDashboard, Database, Building2, Layers, History, Languages, Bell, Palette } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user, setUser, language, setLanguage, notifications, setNotifications, switchRole } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  const userNotifications = notifications.filter(n =>
    (n.userId === user?.id || (user?.role === 'ADMIN' && n.role === 'ADMIN'))
  );
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n =>
      (n.userId === user?.id || (user?.role === 'ADMIN' && n.role === 'ADMIN')) ? { ...n, read: true } : n
    ));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const navItems = {
    RENTER: [
      { label: language === 'ar' ? 'اكتشف المستودعات' : 'Browse Warehouses', path: '/', icon: Database },
      { label: language === 'ar' ? 'حجوزاتي' : 'My Bookings', path: '/my-bookings', icon: History },
    ],
    OWNER: [
      { label: language === 'ar' ? 'مستودعاتي' : 'My Warehouses', path: '/', icon: Building2 },
      { label: language === 'ar' ? 'الطلبات' : 'Bookings', path: '/bookings', icon: Layers },
    ],
    ADMIN: [
      { label: language === 'ar' ? 'لوحة القيادة' : 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: language === 'ar' ? 'الشركات' : 'Companies', path: '/companies', icon: User },
      { label: language === 'ar' ? 'المستودعات' : 'Warehouses', path: '/warehouses', icon: Building2 },
      { label: language === 'ar' ? 'الحجوزات' : 'All Bookings', path: '/all-bookings', icon: History },
    ]
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold text-[#2E5F8A] flex items-center gap-2">
              <div className="p-2 bg-[#2E5F8A]/5 rounded-xl">
                <Building2 className="text-[#2E5F8A]" size={24} />
              </div>
              <span>{language === 'ar' ? 'رفدي' : 'Rafdi'}</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {user && navItems[user.role]?.map((item) => (
                <Link key={item.path} to={item.path}
                  className="text-gray-500 hover:text-[#2E5F8A] flex items-center gap-2 font-medium transition-all">
                  <item.icon size={18} className="opacity-70" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && user.roles?.length > 1 && (
              <div className="hidden lg:flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                {user.roles.map((r) => (
                  <button key={r} onClick={() => { switchRole(r); navigate('/'); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${user.role === r ? 'bg-white text-[#2E5F8A] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                    {r === 'OWNER' ? (language === 'ar' ? 'صاحب مستودع' : 'Owner') : r === 'RENTER' ? (language === 'ar' ? 'مستأجر' : 'Renter') : r}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full text-gray-400 hover:bg-gray-50 relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                    <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute ltr:right-0 rtl:left-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10">
                      <div className="p-5 border-b bg-gray-50/50 flex justify-between items-center">
                        <h4 className="font-bold text-gray-900">{language === 'ar' ? 'التنبيهات' : 'Notifications'}</h4>
                        <button onClick={markAllAsRead} className="text-xs font-bold text-[#2E5F8A]">
                          {language === 'ar' ? 'مقروء الكل' : 'Mark all read'}
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {userNotifications.length === 0 ? (
                          <div className="p-12 text-center">
                            <Bell size={24} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-sm text-gray-400">{language === 'ar' ? 'لا يوجد تنبيهات' : 'No notifications'}</p>
                          </div>
                        ) : (
                          userNotifications.map((note) => (
                            <div key={note.id} onClick={() => markAsRead(note.id)}
                              className={`p-5 border-b border-gray-50 cursor-pointer flex gap-4 ${note.read ? 'bg-white hover:bg-gray-50' : 'bg-[#2E5F8A]/5 hover:bg-[#2E5F8A]/10'}`}>
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${note.read ? 'bg-transparent' : 'bg-[#2E5F8A]'}`} />
                              <div className="flex-1">
                                <p className={`text-sm leading-relaxed ${note.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                  {language === 'ar' ? note.message.ar : note.message.en}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-2">{note.date}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-gray-100 mx-2" />

            <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl text-gray-500 font-bold text-xs transition-all">
              <Languages size={18} className="text-gray-400" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <Link to="/profile" className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-all">
              <User size={20} />
            </Link>

            <button onClick={handleLogout} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};