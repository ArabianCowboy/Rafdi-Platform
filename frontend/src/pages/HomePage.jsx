import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Building2, Layers, Package, CheckCircle, Users, MapPin, Loader, Search, ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { API_URL, getHeaders } from '../config/api';

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    return JSON.parse(atob(token.split('.')[1])).roles || [];
  } catch { return []; }
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
      <h3 className="font-bold text-gray-900 text-sm mb-1 text-right">{w.Name}</h3>
      {w.company?.CompanyName && (
        <div className="flex items-center justify-end gap-1.5 text-gray-400 text-xs mb-2">
          <span>{w.company.CompanyName}</span>
          <Users size={10} className="text-gray-300 shrink-0" />
        </div>
      )}
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
          className="w-full mt-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-lg transition-colors">
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
  const isRenter = roles.includes('renter_company');
  const isOwner = roles.includes('warehouse_owner');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/warehouses/`, { headers: getHeaders(false) });
        if (res.ok) {
          const data = await res.json();
          setWarehouses(data);
          if (isOwner) setMyWarehouses(data.filter(w => w.CompanyID === getCompanyId()));
        }
        if (isRenter) {
          const br = await fetch(`${API_URL}/bookings/my`, { headers: getHeaders(false) });
          if (br.ok) setMyBookings(await br.json());
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredWarehouses = warehouses.filter(w =>
    w.Name?.includes(search) || w.Location?.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-16 px-4">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px', opacity: 0.7,
          maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
        }} />
        <div style={{
          position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(37,99,235,0.18) 30%, transparent 65%)',
          pointerEvents: 'none', filter: 'blur(6px)',
        }} />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '7px 14px 7px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100, fontSize: 13, fontWeight: 500, color: '#cbd5e1', marginBottom: 18,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#60a5fa',
              boxShadow: '0 0 0 4px rgba(96,165,250,0.18), 0 0 14px rgba(96,165,250,0.9)',
            }} />
            السوق اللوجستي الأول في المملكة
          </div>

          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(36px,5vw,56px)', color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em' }}>
            ابحث عن مستودعك المثالي
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.62)', marginBottom: 32 }}>
            {warehouses.filter(w => w.IsActive).length} مستودع متاح في مناطق متعددة
          </p>

          <div style={{
            background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center',
            padding: '6px 6px 6px 18px',
            boxShadow: '0 20px 50px -20px rgba(0,0,0,0.55), 0 4px 10px -2px rgba(0,0,0,0.2)',
            maxWidth: 560, margin: '0 auto',
          }}>
            <Search size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الموقع..."
              style={{
                flex: 1, border: 0, outline: 'none', background: 'transparent',
                padding: '14px 12px', fontFamily: 'inherit', fontSize: 15,
                color: '#0f172a', direction: 'rtl',
              }}
            />
            <button style={{
              background: '#2563eb', color: '#fff', padding: '11px 22px',
              borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 6px 14px -6px rgba(37,99,235,0.6)',
            }}>
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto justify-end">
            {[
              { label: 'إجمالي المستودعات', value: warehouses.length, icon: Building2 },
              { label: 'متاح للحجز', value: warehouses.filter(w => w.IsActive).length, icon: CheckCircle },
              ...(isRenter ? [{ label: 'حجوزاتي', value: myBookings.length, icon: Layers }] : []),
              ...(isOwner ? [{ label: 'مستودعاتي', value: myWarehouses.length, icon: Users }] : []),
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4 border-r border-gray-100 last:border-0 shrink-0">
                <div style={{ width: 42, height: 42, background: '#eff6ff', borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <s.icon size={20} color="#2563eb" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 24, color: '#0f172a', lineHeight: 1 }}>
                    {loading ? '—' : s.value}
                  </p>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouses */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => setActiveTab('warehouses')}
            style={{ color: '#2563eb', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            عرض الكل ({warehouses.length})
            <ChevronLeft size={14} />
          </button>
          <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-0.01em', color: '#0f172a' }}>
            أحدث المستودعات
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={28} className="animate-spin" color="#2563eb" />
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">لا توجد مستودعات مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWarehouses
              .slice(0, activeTab === 'home' ? 3 : filteredWarehouses.length)
              .map(w => (
                <WarehouseCard key={w.WarehouseID} w={w} isRenter={isRenter}
                  onBook={id => navigate(`/booking/${id}`)} />
              ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-6xl mx-auto px-9 py-5 flex items-center justify-between">
          <span style={{ color: '#64748b', fontSize: 13.5 }}>© Rafdi Platform 2026</span>
          <div className="flex items-center gap-2">
            <span style={{
              width: 28, height: 28, background: '#2563eb', borderRadius: 7,
              display: 'grid', placeItems: 'center',
              boxShadow: '0 4px 10px -4px rgba(37,99,235,0.5)',
            }}>
              <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
                <path d="M32 7 L61 28 L3 28 Z" fill="#fff" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"/>
                <path d="M8 28 L8 57 L56 57 L56 28" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/>
                <line x1="2" y1="57" x2="62" y2="57" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/>
                <rect x="13" y="44" width="10" height="13" fill="#fff" rx="1"/>
                <rect x="27" y="37" width="10" height="20" fill="#fff" rx="1"/>
                <rect x="41" y="41" width="10" height="16" fill="#fff" rx="1"/>
              </svg>
            </span>
            <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 16, color: '#0f172a' }}>رفدي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;