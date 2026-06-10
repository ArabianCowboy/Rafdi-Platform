import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Building2, Package, Users, MapPin, Loader, Search, ChevronLeft, TrendingUp, Calendar, DollarSign, Plus } from "lucide-react";
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
  <div dir="rtl" className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors group"
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
      <div className="absolute top-3 right-3"><StatusBadge active={w.IsActive} /></div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
        <p className="text-white font-bold text-lg leading-none text-right">
          {w.PricePerDay?.toLocaleString()}
          <span className="text-white/70 text-sm font-normal mr-1">ر.س / يوم</span>
        </p>
      </div>
    </div>
    <div className="p-4 text-right">
      <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>
        {w.Name}
      </h3>
      {w.company?.CompanyName && (
        <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: '#64748b' }}>
          <Users size={10} className="text-gray-300 shrink-0" /><span>{w.company.CompanyName}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#64748b' }}>
        <MapPin size={11} className="text-gray-400 shrink-0" /><span>{w.Location}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
        <Package size={11} className="text-gray-400 shrink-0" /><span>{w.Size?.toLocaleString()} م²</span>
      </div>
      {w.Description && <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{w.Description}</p>}
      {isRenter && w.IsActive && (
        <button onClick={() => onBook(w.WarehouseID)} style={{
          width: '100%', marginTop: 14, padding: '10px 0',
          background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14,
          borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 6px 14px -6px rgba(37,99,235,0.5)',
        }}>احجز الآن</button>
      )}
    </div>
  </div>
);

function OwnerDashboard({ navigate }) {
  const [myWarehouses, setMyWarehouses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyName = localStorage.getItem('company_name') || 'المستخدم';

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [wRes, bRes] = await Promise.all([
          fetch(`${API_URL}/warehouses/my`, { headers: getHeaders(false) }),
          fetch(`${API_URL}/bookings/owner`, { headers: getHeaders(false) }),
        ]);
        if (wRes.ok) setMyWarehouses(await wRes.json());
        if (bRes.ok) setMyBookings(await bRes.json());
      } catch {} finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const confirmedBookings = myBookings.filter(b => b.Status === 'confirmed');
  const pendingBookings = myBookings.filter(b => b.Status === 'pending');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.TotalPrice || 0), 0);
  const activeWarehouses = myWarehouses.filter(w => w.IsActive);

  const stats = [
    { label: 'مستودعاتي', value: myWarehouses.length, sub: `${activeWarehouses.length} نشط`, icon: Building2, color: '#2563eb', bg: '#eff6ff' },
    { label: 'إجمالي الحجوزات', value: myBookings.length, sub: `${pendingBookings.length} قيد الانتظار`, icon: Calendar, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'حجوزات مؤكدة', value: confirmedBookings.length, sub: 'مكتملة الدفع', icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
    { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} ر.س`, sub: 'من الحجوزات المؤكدة', icon: DollarSign, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-10 px-4">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px', opacity: 0.7,
          maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
        }} />
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.35), transparent 65%)',
          pointerEvents: 'none', filter: 'blur(6px)',
        }} />
        <div className="max-w-6xl mx-auto relative z-10" style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 6 }}>مرحباً بك</p>
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)', color: '#fff', marginBottom: 16 }}>
            {companyName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/warehouses')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 9, background: '#2563eb', border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 14px -6px rgba(37,99,235,0.6)' }}>
              <Plus size={15} />
              إضافة مستودع
            </button>
            <button onClick={() => navigate('/owner-bookings')}
              style={{ padding: '9px 18px', borderRadius: 9, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              إدارة الحجوزات
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', textAlign: 'right', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, direction: 'rtl' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a', lineHeight: 1 }}>
                    {loading ? '—' : s.value}
                  </p>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <s.icon size={18} color={s.color} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, direction: 'rtl' }}>
          <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a' }}>مستودعاتي</h2>
          <button onClick={() => navigate('/warehouses')}
            style={{ color: '#2563eb', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            إدارة المستودعات
            <ChevronLeft size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader size={28} className="animate-spin" color="#2563eb" /></div>
        ) : myWarehouses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 14 }}>لم تضف أي مستودع بعد</p>
            <button onClick={() => navigate('/warehouses')}
              style={{ padding: '9px 20px', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              أضف مستودعك الأول
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myWarehouses.slice(0, 3).map(w => (
              <div key={w.WarehouseID} dir="rtl" className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  {w.ImagePath ? (
                    <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Building2 size={32} color="#cbd5e1" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3"><StatusBadge active={w.IsActive} /></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                    <p className="text-white font-bold text-base leading-none text-right">
                      {w.PricePerDay?.toLocaleString()}
                      <span className="text-white/70 text-xs font-normal mr-1">ر.س / يوم</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 text-right">
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>{w.Name}</h3>
                  <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#64748b' }}>
                    <MapPin size={11} className="text-gray-400 shrink-0" /><span>{w.Location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                    <Package size={11} className="text-gray-400 shrink-0" /><span>{w.Size?.toLocaleString()} م²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {myBookings.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 16px', direction: 'rtl' }}>
              <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a' }}>آخر الحجوزات</h2>
              <button onClick={() => navigate('/owner-bookings')}
                style={{ color: '#2563eb', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                عرض الكل
                <ChevronLeft size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {myBookings.slice(0, 4).map(b => (
                <div key={b.BookingID} dir="rtl" style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '14px 18px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                      {b.warehouse?.Name || `مستودع #${b.WarehouseID}`}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>
                      {b.StartDate} ← {b.EndDate}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                      {parseFloat(b.TotalPrice).toLocaleString()} ر.س
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                      background: b.Status === 'confirmed' ? '#ecfdf5' : b.Status === 'pending' ? '#fffbeb' : '#fef2f2',
                      color: b.Status === 'confirmed' ? '#059669' : b.Status === 'pending' ? '#d97706' : '#ef4444',
                    }}>
                      {b.Status === 'confirmed' ? 'مؤكد' : b.Status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span style={{ color: '#94a3b8', fontSize: 13 }}>© Rafdi Platform 2026</span>
          <div className="flex items-center gap-2">
            <span style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
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

function HomePage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  const roles = getUserRoles();
  const isRenter = roles.includes('renter_company');
  const isOwner = roles.includes('warehouse_owner');
  const selectedRole = localStorage.getItem('selectedRole');

  const showOwnerDashboard = isOwner && (!isRenter || selectedRole === 'owner');

  useEffect(() => {
    if (showOwnerDashboard) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/warehouses/`, { headers: getHeaders(false) });
        if (res.ok) setWarehouses(await res.json());
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [showOwnerDashboard]);

  if (showOwnerDashboard) return <OwnerDashboard navigate={navigate} />;

  const filteredWarehouses = warehouses.filter(w =>
    w.Name?.includes(search) || w.Location?.includes(search)
  );
  const displayedWarehouses = showAll ? filteredWarehouses : filteredWarehouses.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-14 px-4">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px', opacity: 0.7,
          maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
        }} />
        <div style={{
          position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0.15) 30%, transparent 65%)',
          pointerEvents: 'none', filter: 'blur(6px)',
        }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4.5vw,50px)', color: '#fff', lineHeight: 1.15, marginBottom: 10, letterSpacing: '-0.02em' }}>
            ابحث عن مستودعك المثالي
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
            {warehouses.filter(w => w.IsActive).length} مستودع متاح في مناطق متعددة
          </p>
          <div style={{ background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', padding: '5px 5px 5px 16px', direction: 'rtl', boxShadow: '0 20px 50px -20px rgba(0,0,0,0.5), 0 4px 10px -2px rgba(0,0,0,0.15)', maxWidth: 540, margin: '0 auto' }}>
            <Search size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الموقع..."
              style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', padding: '12px 10px', fontFamily: 'inherit', fontSize: 14, color: '#0f172a', direction: 'rtl' }} />
            <button style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px -4px rgba(37,99,235,0.6)' }}>
              بحث
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, direction: 'rtl' }}>
          <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 24, color: '#0f172a' }}>أحدث المستودعات</h2>
          <button onClick={() => setShowAll(!showAll)}
            style={{ color: '#2563eb', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            {showAll ? 'عرض أقل' : `عرض الكل (${warehouses.length})`}
            <ChevronLeft size={14} style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader size={28} className="animate-spin" color="#2563eb" /></div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p style={{ fontSize: 14, color: '#94a3b8' }}>لا توجد مستودعات مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedWarehouses.map(w => (
              <WarehouseCard key={w.WarehouseID} w={w} isRenter={isRenter} onBook={id => navigate(`/booking/${id}`)} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span style={{ color: '#94a3b8', fontSize: 13 }}>© Rafdi Platform 2026</span>
          <div className="flex items-center gap-2">
            <span style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'grid', placeItems: 'center', boxShadow: '0 4px 10px -4px rgba(37,99,235,0.5)' }}>
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