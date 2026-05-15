import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Building2, LogOut, LayoutDashboard, Layers, HeadphonesIcon, Package, CheckCircle, Users, ArrowLeft, MapPin, Loader, Settings, ChevronLeft } from "lucide-react";

const API_URL = 'https://api.rafdi.com';

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    return JSON.parse(atob(token.split('.')[1])).roles || [];
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
    return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).company_id;
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
  const displayName = userInfo.company_name || userInfo.name || userInfo.email || 'المستخدم';

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetch(`${API_URL}/warehouses/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setWarehouses(data);
          if (isOwner) setMyWarehouses(data.filter(w => w.CompanyID === getCompanyId()));
        }
        if (isRenter) {
          const br = await fetch(`${API_URL}/bookings/my`, { headers });
          if (br.ok) setMyBookings(await br.json());
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const navItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, id: 'home' },
    { label: 'المستودعات', icon: Building2, id: 'warehouses' },
    ...(isRenter ? [{ label: 'حجوزاتي', icon: Layers, id: 'bookings' }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', icon: Building2, id: 'my-warehouses' }] : []),
    { label: 'الدعم', icon: HeadphonesIcon, id: 'support' },
  ];

  const stats = [
    { label: 'إجمالي المستودعات', value: warehouses.length, icon: Building2, color: '#2563eb' },
    { label: 'متاح للحجز', value: warehouses.filter(w => w.IsActive).length, icon: CheckCircle, color: '#16a34a' },
    ...(isRenter ? [{ label: 'حجوزاتي', value: myBookings.length, icon: Layers, color: '#d97706' }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', value: myWarehouses.length, icon: Users, color: '#7c3aed' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ر</span>
                </div>
                <span className="text-[#1e3a5f] font-bold text-base tracking-tight">رفدي</span>
              </div>

              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
                    style={{
                      color: activeTab === item.id ? '#1e3a5f' : '#6b7280',
                      background: activeTab === item.id ? '#f0f4f8' : 'transparent'
                    }}>
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {isOwner && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">مالك</span>
                )}
                {isRenter && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">مستأجر</span>
                )}
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{displayName.charAt(0)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden md:block">{displayName}</span>
              </div>

              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">
                <LogOut size={15} />
                <span className="hidden md:block">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 py-6">
          <p className="text-sm text-gray-500 mb-0.5">{getGreeting()}</p>
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex divide-x divide-x-reverse divide-gray-100">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3 py-4 px-6 first:pr-0 last:pl-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}15` }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {loading ? '—' : stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* Quick Actions */}
        {activeTab === 'home' && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider text-right mb-3">إجراءات سريعة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'استعرض المستودعات', icon: Building2, action: () => setActiveTab('warehouses') },
                ...(isRenter ? [{ label: 'حجوزاتي', icon: Layers, action: () => setActiveTab('bookings') }] : []),
                ...(isOwner ? [{ label: 'مستودعاتي', icon: Building2, action: () => setActiveTab('my-warehouses') }] : []),
                ...(isOwner ? [{ label: 'إدارة المستودعات', icon: Settings, action: () => navigate('/warehouses') }] : []),
              ].map((action, i) => (
                <button key={i} onClick={action.action}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-right hover:border-[#1e3a5f] hover:bg-gray-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    <action.icon size={16} className="text-gray-600 group-hover:text-[#1e3a5f] transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1e3a5f] transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warehouses Tab */}
        {(activeTab === 'home' || activeTab === 'warehouses') && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setActiveTab('warehouses')}
                className="flex items-center gap-1 text-sm font-semibold text-[#1e3a5f] hover:underline">
                عرض الكل
                <ChevronLeft size={15} />
              </button>
              <div className="text-right">
                <h2 className="text-base font-bold text-gray-900">المستودعات المتاحة</h2>
                <p className="text-xs text-gray-500">{warehouses.filter(w => w.IsActive).length} مستودع متاح للحجز</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader size={28} className="text-[#1e3a5f] animate-spin" />
              </div>
            ) : warehouses.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">لا توجد مستودعات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {warehouses.slice(0, activeTab === 'home' ? 3 : warehouses.length).map((w) => (
                  <div key={w.WarehouseID}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="h-40 relative bg-gray-100">
                      {w.ImagePath ? (
                        <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#f0f4f8]">
                          <Building2 size={40} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${w.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {w.IsActive ? 'متاح' : 'غير متاح'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-bold text-[#1e3a5f]">
                          {w.PricePerDay?.toLocaleString()} <span className="text-xs font-normal text-gray-400">ر.س/يوم</span>
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm text-right">{w.Name}</h3>
                      </div>

                      <div className="flex flex-col gap-1 mb-4">
                        <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs">
                          <span>{w.Location}</span>
                          <MapPin size={12} className="text-gray-400" />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs">
                          <span>{w.Size} م²</span>
                          <Package size={12} className="text-gray-400" />
                        </div>
                      </div>

                      {isRenter && w.IsActive && (
                        <button onClick={() => navigate(`/booking/${w.WarehouseID}`)}
                          className="w-full py-2 rounded-lg text-sm font-bold text-white bg-[#1e3a5f] hover:bg-[#162d4a] transition-colors">
                          احجز الآن
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && isRenter && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-500">{myBookings.length} حجز</span>
              <h2 className="text-base font-bold text-gray-900">حجوزاتي</h2>
            </div>

            {myBookings.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                <Layers size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium mb-4">لا توجد حجوزات حالياً</p>
                <button onClick={() => setActiveTab('warehouses')}
                  className="px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#162d4a] transition-colors">
                  استعرض المستودعات
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['المستودع', 'تاريخ البداية', 'تاريخ النهاية', 'المبلغ', 'الحالة'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myBookings.map((b) => (
                      <tr key={b.BookingID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{b.warehouse?.Name || `#${b.WarehouseID}`}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.StartDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.EndDate}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#1e3a5f]">{parseFloat(b.TotalPrice).toLocaleString()} ر.س</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            b.Status === 'confirmed' ? 'bg-green-50 text-green-700' :
                            b.Status === 'pending' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {b.Status === 'confirmed' ? 'مؤكد' : b.Status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* My Warehouses Tab */}
        {activeTab === 'my-warehouses' && isOwner && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => navigate('/warehouses')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#162d4a] transition-colors">
                <Settings size={14} />
                إدارة المستودعات
              </button>
              <div className="text-right">
                <h2 className="text-base font-bold text-gray-900">مستودعاتي</h2>
                <p className="text-xs text-gray-500">{myWarehouses.length} مستودع</p>
              </div>
            </div>

            {myWarehouses.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium mb-4">لا توجد مستودعات مسجلة</p>
                <button onClick={() => navigate('/warehouses')}
                  className="px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#162d4a] transition-colors">
                  أضف مستودعك الأول
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myWarehouses.map((w) => (
                  <div key={w.WarehouseID}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="h-36 bg-gray-100 relative">
                      {w.ImagePath ? (
                        <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={36} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${w.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {w.IsActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 text-right">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">{w.Name}</h3>
                      <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs mb-1">
                        <span>{w.Location}</span>
                        <MapPin size={11} className="text-gray-400" />
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{w.Size} م²</span>
                        <span className="text-sm font-bold text-[#1e3a5f]">{w.PricePerDay?.toLocaleString()} ر.س/يوم</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="border-t border-gray-200 py-5 mt-8">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default HomePage;
