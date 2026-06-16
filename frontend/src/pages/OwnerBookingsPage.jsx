import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, Loader, Layers, Users, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders, apiFetch } from '../config/api';

const statusConfig = {
  confirmed: { label: 'مؤكد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  pending:   { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};

function OwnerBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiFetch(`${API_URL}/bookings/owner`, { headers: getHeaders(false) });
        if (res.ok) setBookings(await res.json());
      } catch {} finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.Status === filter);

  const stats = [
    { label: 'إجمالي الحجوزات', value: bookings.length, color: '#0f172a' },
    { label: 'مؤكدة', value: bookings.filter(b => b.Status === 'confirmed').length, color: '#10b981' },
    { label: 'قيد الانتظار', value: bookings.filter(b => b.Status === 'pending').length, color: '#f59e0b' },
    { label: 'ملغية', value: bookings.filter(b => b.Status === 'cancelled').length, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {/* Page header */}
      <div style={{ background: '#0d1b3e' }} className="py-8 px-4">
        <div className="max-w-5xl mx-auto text-right">
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 4 }}>
            حجوزات مستودعاتي
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 15 }}>عرض جميع الحجوزات على مستودعاتك</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: s.color, lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 5 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'confirmed', label: 'مؤكدة' },
            { key: 'pending', label: 'قيد الانتظار' },
            { key: 'cancelled', label: 'ملغية' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: filter === f.key ? 'none' : '1px solid #e2e8f0',
                background: filter === f.key ? '#2563eb' : '#fff',
                color: filter === f.key ? '#fff' : '#475569',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} color="#2563eb" className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Layers size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">لا توجد حجوزات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => {
              const status = statusConfig[b.Status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const warehouse = b.warehouse;
              const imageUrl = warehouse?.ImagePath;

              return (
                <div key={b.BookingID}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${b.Status === 'cancelled' ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-blue-200'}`}
                  style={{ boxShadow: '0 12px 32px -26px rgba(15,23,42,0.55)' }}>

                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-44 md:h-auto md:w-52 shrink-0 bg-gray-100 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={warehouse?.Name || 'المستودع'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50">
                          <Building2 size={38} className="text-slate-300" />
                        </div>
                      )}
                      <div className="absolute right-3 top-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border shadow-sm ${status.className}`}>
                          <StatusIcon size={11} />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 text-right">
                          <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                            {warehouse?.Name || `مستودع #${b.WarehouseID}`}
                          </p>
                          {warehouse?.Location && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                              <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
                              <span className="leading-5">{warehouse.Location}</span>
                            </div>
                          )}
                          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <Users size={12} color="#94a3b8" />
                              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                                {b.renter_company?.CompanyName || `شركة #${b.RenterCompanyID}`}
                              </p>
                            </div>
                            {b.renter_company?.CommercialRegistration && (
                              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                سجل تجاري: {b.renter_company.CommercialRegistration}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-row-reverse items-center justify-between gap-3 md:flex-col md:items-end">
                          <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 900, fontSize: 19, color: '#0f172a' }}>
                            {parseFloat(b.TotalPrice).toLocaleString()}
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginRight: 3 }}>ر.س</span>
                          </span>
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                            #{b.BookingID}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          <span className="font-mono">{b.StartDate}</span>
                          <span className="text-gray-300 mx-1">←</span>
                          <span className="font-mono">{b.EndDate}</span>
                        </div>
                        {warehouse?.Size && (
                          <span className="text-xs font-semibold text-slate-400">
                            المساحة {warehouse.Size?.toLocaleString()} م²
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <p style={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}>{filtered.length} حجز</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-5 text-center">
          <span style={{ color: '#64748b', fontSize: 13 }}>© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default OwnerBookingsPage;
