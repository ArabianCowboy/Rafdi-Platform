import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Building2, LogOut, Layers, Package, CheckCircle, Users, MapPin, Loader, Settings, Search, ChevronLeft, LayoutDashboard } from "lucide-react";

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

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'متاح' : 'غير متاح'}
  </span>
);

const WarehouseCard = ({ w, isRenter, onBook }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors group">
    <div className="relative h-48 bg-gray-100 overflow-hidden">
      {w.ImagePath ? (
        <img src={w.ImagePath} alt={w.Name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
          <Building2 size={32} className="text-gray-300" />
          <span className="text-xs text-gray-400">لا توجد صورة</span>
        </div>
      )}
      <div className="absolute top-3 right-3">
        <StatusBadge active={w.IsActive} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
        <p className="text-white font-bold text-lg leading-none">
          {w.PricePerDay?.toLocaleString()}
          <span className="text-white/70 text-sm font-normal mr-1">ر.س / يوم</span>
        </p>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-900 text-sm mb-2 text-right">{w.Name}</h3>
      <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs mb-1">
        <span>{w.Location}</span>
        <MapPin size={11} className="text-gray-400 shrink-0" />
      </div>
      <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs">
        <span>{w.Size?.toLocaleString()} م²</span>
        <Package size={11} className="text-gray-400 shrink-0" />
      </div>
      {w.Description && (
        <p className="text-xs text-gray-400 mt-2 text-right line-clamp-2 leading-relaxed">{w.Description}</p>
      )}
      {isRenter && w.IsActive && (
        <button onClick={() => onBook(w.WarehouseID)}
          className="w-full mt-4 py-2.5 bg-[#1a3a5c] hover:bg-[#14304e] text-white text-sm font-bold rounded-lg transition-colors">
          احجز الآن
        </button>
      )}
    </div>
  </div>
);

function HomePage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [myWarehouses, setMyWarehouses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');

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

  const filteredWarehouses = warehouses.filter(w =>
    w.Name?.includes(search) || w.Location?.includes(search)
  );

  const navItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, id: 'home', path: null },
    ...(isRenter ? [{ label: 'حجوزاتي', icon: Layers, id: 'bookings', path: '/bookings' }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', icon: Building2, id: 'my-warehouses', path: '/warehouses' }] : []),
    ...(isOwner ? [{ label: 'إدارة الحجوزات', icon: Users, id: 'owner-bookings', path: '/owner-bookings' }] : []),
  ];

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
                <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
                  <span className="text-white font-black text-sm">ر</span>
                </div>
                <span className="text-[#1a3a5c] font-black text-lg">رفدي</span>
              </div>

              <nav className="hidden md:flex items-center gap-0.5">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => handleNavClick(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{
                      color: activeTab === item.id ? '#1a3a5c' : '#6b7280',
                      background: activeTab === item.id ? '#eef2f7' : 'transparent'
                    }}>
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5">
                {isOwner && <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">مالك</span>}
                {isRenter && <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">مستأجر</span>}
              </div>
              <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
                <span className="text-sm font-semibold text-gray-700 hidden md:block max-w-[120px] truncate">{displayName}</span>
                <div className="w-8 h-8 rounded-full bg-[#1a3a5c] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{displayName.charAt(0)}</span>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      {(activeTab === 'home' || activeTab === 'warehouses') && (
        <div className="bg-[#1a3a5c] py-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-black text-white mb-1">ابحث عن مستودعك المثالي</h1>
            <p className="text-blue-200 text-sm mb-6">
              {warehouses.filter(w => w.IsActive).length} مستودع متاح في مناطق متعددة
            </p>
            <div className="relative">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو الموقع..."
                className="w-full py-3.5 pr-12 pl-4 rounded-xl text-sm font-medium bg-white border border-gray-200 outline-none text-gray-900 placeholder:text-gray-400" />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Stats strip */}
      {activeTab === 'home' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              {[
                { label: 'إجمالي المستودعات', value: warehouses.length, icon: Building2 },
                { label: 'متاح للحجز', value: warehouses.filter(w => w.IsActive).length, icon: CheckCircle },
                ...(isRenter ? [{ label: 'حجوزاتي', value: myBookings.length, icon: Layers }] : []),
                ...(isOwner ? [{ label: 'مستودعاتي', value: myWarehouses.length, icon: Users }] : []),
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 border-l border-gray-100 last:border-0 first:border-0 shrink-0">
                  <s.icon size={18} className="text-gray-400" />
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-none">{loading ? '—' : s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Quick actions */}
        {activeTab === 'home' && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 mb-3 text-right">وصول سريع</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((a, i) => (
                <button key={i} onClick={a.action}
                  className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl text-right hover:border-[#1a3a5c] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <a.icon size={15} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warehouses listing */}
        {(activeTab === 'home' || activeTab === 'warehouses') && (
          <section>
            <div className="flex justify-between items-center mb-5">
              <button onClick={() => setActiveTab('warehouses')}
                className="flex items-center gap-1 text-sm font-semibold text-[#1a3a5c] hover:underline">
                عرض الكل ({warehouses.length})
                <ChevronLeft size={14} />
              </button>
              <h2 className="text-base font-black text-gray-900">
                {activeTab === 'home' ? 'أحدث المستودعات' : 'جميع المستودعات'}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader size={26} className="text-[#1a3a5c] animate-spin" />
              </div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">لا توجد مستودعات مطابقة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWarehouses
                  .slice(0, activeTab === 'home' ? 3 : filteredWarehouses.length)
                  .map(w => (
                    <WarehouseCard key={w.WarehouseID} w={w} isRenter={isRenter}
                      onBook={id => navigate(`/booking/${id}`)} />
                  ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">© 2026 Rafdi Platform</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1a3a5c] flex items-center justify-center">
              <span className="text-white font-bold text-xs">ر</span>
            </div>
            <span className="text-xs font-bold text-gray-600">رفدي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;