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
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors group"
    style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
        <p className="text-white font-bold text-lg leading-none">
          {w.PricePerDay?.toLocaleString()}
          <span className="text-white/70 text-sm font-normal mr-1">ر.س / يوم</span>
        </p>
      </div>
    </div>
    <div className="p-4">
      <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6, textAlign: 'right' }}>
        {w.Name}
      </h3>
      {w.company?.CompanyName && (
        <div className="flex items-center justify-end gap-1.5 text-xs mb-2" style={{ color: '#64748b' }}>
          <span>{w.company.CompanyName}</span>
          <Users size={10} className="text-gray-300 shrink-0" />
        </div>
      )}
      <div className="flex items-center justify-end gap-1.5 text-xs mb-1" style={{ color: '#64748b' }}>
        <span>{w.Location}</span>
        <MapPin size={11} className="text-gray-400 shrink-0" />
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs" style={{ color: '#64748b' }}>
        <span>{w.Size?.toLocaleString()} م²</span>
        <Package size={11} className="text-gray-400 shrink-0" />
      </div>
      {w.Description && (
        <p className="text-xs text-gray-400 mt-2 text-right line-clamp-2 leading-relaxed">{w.Description}</p>
      )}
      {isRenter && w.IsActive && (
        <button onClick={() => onBook(w.WarehouseID)}
          style={{
            width: '100%', marginTop: 14, padding: '10px 0',
            background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14,
            borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 14px -6px rgba(37,99,235,0.5)',
          }}>
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
  const [showAll, setShowAll] = useState(false);
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

  const displayedWarehouses = showAll ? filteredWarehouses : filteredWarehouses.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-14 px-4">
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px', opacity: 0.7,
          maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
        }} />
        {/* glow */}
        <div style={{
          position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0.15) 30%, transparent 65%)',
          pointerEvents: 'none', filter: 'blur(6px)',
        }} />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 style={{
            fontFamily: "'Tajawal', sans-serif", fontWeight: 800,
            fontSize: 'clamp(30px,4.5vw,50px)', color: '#fff',
            lineHeight: 1.15, marginBottom: 10, letterSpacing: '-0.02em',
          }}>
            ابحث عن مستودعك المثالي
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
            {warehouses.filter(w => w.IsActive).length} مستودع متاح في مناطق متعددة
          </p>

          {/* Search */}
          <div style={{
            background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center',
            padding: '5px 5px 5px 16px',
            boxShadow: '0 20px 50px -20px rgba(0,0,0,0.5), 0 4px 10px -2px rgba(0,0,0,0.15)',
            maxWidth: 540, margin: '0 auto',
          }}>
            <Search size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الموقع..."
              style={{
                flex: 1, border: 0, outline: 'none', background: 'transparent',
                padding: '12px 10px', fontFamily: 'inherit', fontSize: 14,
                color: '#0f172a', direction: 'rtl',
              }}
            />
            <button style={{
              background: '#2563eb', color: '#fff', padding: '10px 20px',
              borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 12px -4px rgba(37,99,235,0.6)',
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
              <div key={i} className="flex items-center gap-3 px-6 py-4 shrink-0"
                style={{ borderRight: i !== 0 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 40, height: 40, background: '#eff6ff', borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <s.icon size={18} color="#2563eb" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a', lineHeight: 1 }}>
                    {loading ? '—' : s.value}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouses */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          {/* يسار — عرض الكل */}
          <button onClick={() => setShowAll(!showAll)}
            style={{
              color: '#2563eb', fontWeight: 600, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {showAll ? 'عرض أقل' : `عرض الكل (${warehouses.length})`}
            <ChevronLeft size={14} style={{ transform: showAll ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
          </button>

          {/* يمين — العنوان */}
          <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 24, color: '#0f172a' }}>
            أحدث المستودعات
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={28} className="animate-spin" color="#2563eb" />
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p style={{ fontSize: 14, color: '#94a3b8' }}>لا توجد مستودعات مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedWarehouses.map(w => (
              <WarehouseCard key={w.WarehouseID} w={w} isRenter={isRenter}
                onBook={id => navigate(`/booking/${id}`)} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span style={{ color: '#94a3b8', fontSize: 13 }}>© Rafdi Platform 2026</span>
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