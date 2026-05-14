import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Building2, LogOut, LayoutDashboard, Layers, HeadphonesIcon, Package, CheckCircle, Users, ArrowLeft, MapPin, Star, Loader, Settings } from "lucide-react";

const API_URL = 'https://api.rafdi.com';

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles || [];
  } catch { return []; }
};

const getUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
};

const getCompanyId = () => {
  try {
    const token = localStorage.getItem('token');
    return JSON.parse(atob(token.split('.')[1])).company_id;
  } catch { return null; }
};

function HomePage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myWarehouses, setMyWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const roles = getUserRoles();
  const userInfo = getUserInfo();
  const isRenter = roles.includes('renter_company');
  const isOwner = roles.includes('warehouse_owner');

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // جلب كل المستودعات
        const warehousesRes = await fetch(`${API_URL}/warehouses/`, { headers });
        if (warehousesRes.ok) {
          const data = await warehousesRes.json();
          setWarehouses(data);
          // فلترة مستودعاتي من الكل بدون endpoint إضافي
          if (isOwner) {
            const companyId = getCompanyId();
            setMyWarehouses(data.filter(w => w.CompanyID === companyId));
          }
        }

        if (isRenter) {
          const bookingsRes = await fetch(`${API_URL}/bookings/my`, { headers });
          if (bookingsRes.ok) setMyBookings(await bookingsRes.json());
        }

      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const navItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, id: 'home' },
    { label: 'المستودعات', icon: Building2, id: 'warehouses' },
    ...(isRenter ? [{ label: 'حجوزاتي', icon: Layers, id: 'bookings' }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', icon: Building2, id: 'my-warehouses' }] : []),
    { label: 'الدعم', icon: HeadphonesIcon, id: 'support' },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const displayName = userInfo.company_name || userInfo.name || userInfo.email || 'مرحباً بك';

  const stats = [
    { label: 'مستودع مسجل', value: warehouses.length, icon: Building2, color: '#3B82F6' },
    { label: 'جاهزة للحجز', value: warehouses.filter(w => w.IsActive).length, icon: CheckCircle, color: '#10B981' },
    ...(isRenter ? [{ label: 'حجز نشط', value: myBookings.length, icon: Layers, color: '#F59E0B' }] : []),
    ...(isOwner ? [{ label: 'مستودع مملوك', value: myWarehouses.length, icon: Users, color: '#8B5CF6' }] : []),
  ];

  const quickActions = [
    { label: 'استعرض المستودعات', icon: Building2, color: '#2E5F8A', bg: 'rgba(46,95,138,0.08)', action: () => setActiveTab('warehouses') },
    ...(isRenter ? [{ label: 'حجوزاتي', icon: Layers, color: '#10B981', bg: 'rgba(16,185,129,0.08)', action: () => setActiveTab('bookings') }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', icon: Building2, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', action: () => setActiveTab('my-warehouses') }] : []),
    ...(isOwner ? [{ label: 'إدارة المستودعات', icon: Settings, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', action: () => navigate('/warehouses') }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                  <span className="text-white font-black">ر</span>
                </div>
                <span className="text-[#0f2744] font-black text-xl">رفدي</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: activeTab === item.id ? 'rgba(46,95,138,0.08)' : 'transparent',
                      color: activeTab === item.id ? '#2E5F8A' : '#6B7280'
                    }}>
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex gap-2">
                {isOwner && <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-600 border border-blue-100">مالك مستودع</span>}
                {isRenter && <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100">مستأجر</span>}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                {displayName.charAt(0)}
              </div>

              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={16} />
                خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="relative overflow-hidden"
        style={{background: 'linear-gradient(135deg, #0f2744 0%, #1a3f6f 50%, #2E5F8A 100%)'}}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-white/50 text-sm font-bold mb-1">{getGreeting()} 👋</p>
            <h1 className="text-3xl font-black text-white mb-1">{displayName}</h1>
            <p className="text-white/50 text-sm font-medium">
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Stats */}
          <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
            {stats.map((stat, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{background: `${stat.color}30`}}>
                  <stat.icon size={18} style={{color: stat.color}} />
                </div>
                <p className="text-3xl font-black text-white">{loading ? '—' : stat.value}</p>
                <p className="text-white/60 text-xs font-bold mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Quick Actions */}
        {activeTab === 'home' && quickActions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h2 className="text-lg font-black text-[#0f2744] text-right mb-4">إجراءات سريعة</h2>
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(quickActions.length, 4)} gap-4`}>
              {quickActions.map((action, i) => (
                <motion.button key={i} onClick={action.action}
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  className="p-5 rounded-2xl text-right transition-all border border-gray-100 bg-white hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{background: action.bg}}>
                    <action.icon size={20} style={{color: action.color}} />
                  </div>
                  <p className="font-black text-sm text-[#0f2744]">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab: المستودعات */}
        {(activeTab === 'home' || activeTab === 'warehouses') && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <motion.button onClick={() => setActiveTab('warehouses')}
                whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 text-[#2E5F8A] font-black text-sm">
                عرض الكل
                <ArrowLeft size={16} />
              </motion.button>
              <div className="text-right">
                <h2 className="text-xl font-black text-[#0f2744]">المستودعات المتاحة</h2>
                <p className="text-gray-400 text-sm font-medium">{warehouses.filter(w => w.IsActive).length} مستودع متاح</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader size={40} className="text-[#2E5F8A] animate-spin" />
              </div>
            ) : warehouses.length === 0 ? (
              <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Building2 size={60} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">لا توجد مستودعات متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {warehouses.slice(0, activeTab === 'home' ? 3 : warehouses.length).map((w, idx) => (
                  <motion.div key={w.WarehouseID}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(46,95,138,0.15)' }}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 group">
                    <div className="h-44 relative overflow-hidden"
                      style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                      {w.ImagePath ? (
                        <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Building2 className="absolute inset-0 m-auto text-white/10" size={80} />
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black text-white border ${w.IsActive ? 'bg-emerald-500/30 border-emerald-400/30' : 'bg-red-500/30 border-red-400/30'}`}>
                          {w.IsActive ? 'متاح' : 'غير متاح'}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                        <p className="text-white font-black text-sm">
                          {w.PricePerDay?.toLocaleString()} <span className="text-white/60 font-bold text-xs">ر.س/يوم</span>
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-black text-gray-700">4.5</span>
                        </div>
                        <h3 className="font-black text-[#0f2744] text-right">{w.Name}</h3>
                      </div>
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                          <span className="font-medium">{w.Location}</span>
                          <MapPin size={14} className="text-[#2E5F8A]" />
                        </div>
                        <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                          <span className="font-medium">{w.Size} م²</span>
                          <Package size={14} className="text-[#2E5F8A]" />
                        </div>
                      </div>
                      {isRenter && w.IsActive && (
                        <motion.button onClick={() => navigate(`/booking/${w.WarehouseID}`)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full py-3 rounded-2xl font-black text-sm text-white transition-all"
                          style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)', boxShadow: '0 4px 15px rgba(46,95,138,0.25)'}}>
                          احجز الآن
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: حجوزاتي */}
        {activeTab === 'bookings' && isRenter && (
          <section>
            <div className="text-right mb-6">
              <h2 className="text-2xl font-black text-[#0f2744]">حجوزاتي</h2>
              <p className="text-gray-400 font-medium">{myBookings.length} حجز</p>
            </div>
            {myBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Layers size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">لا توجد حجوزات حالياً</p>
                <motion.button onClick={() => setActiveTab('warehouses')}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="mt-4 px-6 py-3 rounded-2xl font-black text-white text-sm"
                  style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                  استعرض المستودعات
                </motion.button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['المستودع', 'تاريخ البداية', 'تاريخ النهاية', 'المبلغ', 'الحالة'].map(h => (
                        <th key={h} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myBookings.map((b, idx) => (
                      <motion.tr key={b.BookingID}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-black text-[#0f2744]">{b.warehouse?.Name || `مستودع #${b.WarehouseID}`}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{b.StartDate}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{b.EndDate}</td>
                        <td className="px-6 py-4 font-black text-[#2E5F8A]">{parseFloat(b.TotalPrice).toLocaleString()} ر.س</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            b.Status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                            b.Status === 'pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {b.Status === 'confirmed' ? 'مؤكد' : b.Status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tab: مستودعاتي */}
        {activeTab === 'my-warehouses' && isOwner && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <motion.button onClick={() => navigate('/warehouses')}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm text-white"
                style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                <Settings size={16} />
                إدارة المستودعات
              </motion.button>
              <div className="text-right">
                <h2 className="text-2xl font-black text-[#0f2744]">مستودعاتي</h2>
                <p className="text-gray-400 font-medium">{myWarehouses.length} مستودع</p>
              </div>
            </div>
            {myWarehouses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">لا توجد مستودعات مسجلة</p>
                <motion.button onClick={() => navigate('/warehouses')}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="mt-4 px-6 py-3 rounded-2xl font-black text-white text-sm"
                  style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                  أضف مستودعك الأول
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myWarehouses.map((w, idx) => (
                  <motion.div key={w.WarehouseID}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(46,95,138,0.15)' }}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all">
                    <div className="h-40 relative overflow-hidden"
                      style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                      {w.ImagePath ? (
                        <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="absolute inset-0 m-auto text-white/10" size={60} />
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${w.IsActive ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
                          {w.IsActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 text-right">
                      <h3 className="font-black text-[#0f2744] mb-2">{w.Name}</h3>
                      <div className="flex items-center justify-end gap-2 text-gray-400 text-sm mb-1">
                        <span>{w.Location}</span>
                        <MapPin size={14} className="text-[#2E5F8A]" />
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-[#2E5F8A] font-black">{w.PricePerDay?.toLocaleString()} ر.س/يوم</span>
                        <span className="text-gray-400 text-xs font-bold">{w.Size} م²</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-gray-400 text-xs font-bold">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default HomePage;