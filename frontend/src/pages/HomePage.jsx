import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Building2, LogOut, LayoutDashboard, Layers, HeadphonesIcon, Package, CheckCircle, Users, ArrowLeft, MapPin, Star, Loader } from "lucide-react";

const API_URL = 'https://api.rafdi.com';

// قراءة الـ roles من الـ JWT token
const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles || [];
  } catch {
    return [];
  }
};

function HomePage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myWarehouses, setMyWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const roles = getUserRoles();
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

        // جلب المستودعات دائماً
        const warehousesRes = await fetch(`${API_URL}/warehouses/`, { headers });
        if (warehousesRes.ok) {
          const data = await warehousesRes.json();
          setWarehouses(data);
        }

        // جلب حجوزاتي إذا كان مستأجر
        if (isRenter) {
          const bookingsRes = await fetch(`${API_URL}/bookings/my`, { headers });
          if (bookingsRes.ok) {
            const data = await bookingsRes.json();
            setMyBookings(data);
          }
        }

        // جلب مستودعاتي إذا كان مالك
        if (isOwner) {
          const myWarehousesRes = await fetch(`${API_URL}/warehouses/my`, { headers });
          if (myWarehousesRes.ok) {
            const data = await myWarehousesRes.json();
            setMyWarehouses(data);
          }
        }

      } catch {
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "المستودعات", value: warehouses.length || '0', icon: Building2, color: '#3B82F6' },
    { label: "الحجوزات النشطة", value: myBookings.length || '0', icon: Layers, color: '#10B981' },
    { label: "المتاحة الآن", value: warehouses.filter(w => w.IsActive).length || '0', icon: CheckCircle, color: '#F59E0B' },
    { label: isOwner ? "مستودعاتي" : "الشركات", value: isOwner ? myWarehouses.length : '0', icon: Users, color: '#8B5CF6' },
  ];

  const navItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, id: 'home' },
    { label: 'المستودعات', icon: Building2, id: 'warehouses' },
    ...(isRenter ? [{ label: 'حجوزاتي', icon: Layers, id: 'bookings' }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', icon: Building2, id: 'my-warehouses' }] : []),
    { label: 'الدعم', icon: HeadphonesIcon, id: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-18 py-3">
            <div className="flex items-center gap-10">
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
              {/* Role Badges */}
              <div className="hidden md:flex gap-2">
                {isOwner && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-600 border border-blue-100">
                    مالك مستودع
                  </span>
                )}
                {isRenter && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                    مستأجر
                  </span>
                )}
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

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6"
        style={{background: 'linear-gradient(135deg, #0f2744 0%, #1a3f6f 50%, #2E5F8A 100%)'}}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-right max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/80 text-xs font-bold">{warehouses.filter(w => w.IsActive).length} مستودع متاح الآن</span>
              </div>
              <h1 className="text-5xl font-black text-white leading-tight mb-5">
                أدر مستودعاتك<br />
                <span style={{color: '#4A8ABF'}}>بذكاء وكفاءة</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                منصة متكاملة لإدارة وحجز المستودعات اللوجستية في جميع أنحاء المملكة العربية السعودية.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setActiveTab('warehouses')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[#0f2744] bg-white hover:bg-gray-50 transition-all shadow-xl">
                  <Package size={20} />
                  استعرض المستودعات
                </button>
                {isRenter && (
                  <button onClick={() => setActiveTab('bookings')}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all">
                    <Layers size={20} />
                    حجوزاتي
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {stats.map((stat, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{background: `${stat.color}30`}}>
                    <stat.icon size={20} style={{color: stat.color}} />
                  </div>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-white/50 text-xs font-bold mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Tab: المستودعات */}
        {(activeTab === 'home' || activeTab === 'warehouses') && (
          <section>
            <div className="flex justify-between items-center mb-10">
              <button onClick={() => setActiveTab('warehouses')}
                className="flex items-center gap-2 text-[#2E5F8A] font-black text-sm hover:gap-3 transition-all">
                عرض الكل
                <ArrowLeft size={16} />
              </button>
              <div className="text-right">
                <p className="text-gray-400 text-sm font-medium">اختر المناسب لك</p>
                <h2 className="text-2xl font-black text-[#0f2744]">المستودعات المميزة</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader size={40} className="text-[#2E5F8A] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {warehouses.slice(0, activeTab === 'home' ? 3 : warehouses.length).map((w, idx) => (
                  <motion.div key={w.WarehouseID}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="h-44 relative overflow-hidden"
                      style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                      {w.ImagePath ? (
                        <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Building2 className="absolute inset-0 m-auto text-white/10" size={80} />
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-white/20 border border-white/30">
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
                      {isRenter && (
                        <button onClick={() => navigate(`/booking/${w.WarehouseID}`)}
                          className="w-full py-3 rounded-2xl font-black text-sm text-white transition-all group-hover:shadow-lg"
                          style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                          احجز الآن
                        </button>
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
            <div className="text-right mb-10">
              <h2 className="text-2xl font-black text-[#0f2744]">حجوزاتي</h2>
              <p className="text-gray-400 font-medium">جميع حجوزاتك النشطة والسابقة</p>
            </div>
            {myBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Layers size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">لا توجد حجوزات حالياً</p>
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
            <div className="text-right mb-10">
              <h2 className="text-2xl font-black text-[#0f2744]">مستودعاتي</h2>
              <p className="text-gray-400 font-medium">المستودعات المسجلة باسمك</p>
            </div>
            {myWarehouses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">لا توجد مستودعات مسجلة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myWarehouses.map((w, idx) => (
                  <motion.div key={w.WarehouseID}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                    <div className="h-40 relative"
                      style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                      <Building2 className="absolute inset-0 m-auto text-white/10" size={60} />
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

        {/* Features */}
        {activeTab === 'home' && (
          <section className="mt-16">
            <div className="rounded-3xl p-10 text-right"
              style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { icon: '⚡', label: 'حجز فوري' },
                    { icon: '🔒', label: 'دفع آمن' },
                    { icon: '📱', label: 'متاح 24/7' },
                  ].map((f, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl mb-2">{f.icon}</div>
                      <p className="text-white/80 font-black text-sm">{f.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-black text-white mb-2">جاهز للبدء؟</h3>
                  <p className="text-white/60 font-medium mb-4">انضم لأكثر من 500 شركة تثق بمنصة رفدي</p>
                  <button onClick={() => navigate('/register')}
                    className="px-8 py-3 bg-white rounded-2xl font-black text-[#0f2744] hover:bg-gray-50 transition-all">
                    ابدأ الآن مجاناً
                  </button>
                </div>
              </div>
            </div>
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