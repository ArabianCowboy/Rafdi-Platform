import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Calendar, Loader, Layers, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

const API_URL = 'https://api.rafdi.com';

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
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/bookings/owner`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setBookings(await res.json());
      } catch {} finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.Status === filter);

  const stats = [
    { label: 'إجمالي الحجوزات', value: bookings.length, color: 'text-gray-900' },
    { label: 'مؤكدة', value: bookings.filter(b => b.Status === 'confirmed').length, color: 'text-emerald-600' },
    { label: 'قيد الانتظار', value: bookings.filter(b => b.Status === 'pending').length, color: 'text-amber-600' },
    { label: 'ملغية', value: bookings.filter(b => b.Status === 'cancelled').length, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-14">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/home')}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                <div className="w-7 h-7 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
                  <span className="text-white font-black text-xs">ر</span>
                </div>
                <span className="text-[#1a3a5c] font-black text-base">رفدي</span>
              </div>
            </div>

            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="bg-[#1a3a5c] py-8 px-4">
        <div className="max-w-5xl mx-auto text-right">
          <h1 className="text-xl font-black text-white mb-1">حجوزات مستودعاتي</h1>
          <p className="text-blue-200 text-sm">عرض جميع الحجوزات على مستودعاتك</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-right">
              <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'confirmed', label: 'مؤكدة' },
            { key: 'pending', label: 'قيد الانتظار' },
            { key: 'cancelled', label: 'ملغية' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === f.key
                  ? 'bg-[#1a3a5c] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} className="text-[#1a3a5c] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Layers size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">لا توجد حجوزات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const status = statusConfig[b.Status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div key={b.BookingID}
                  className={`bg-white border rounded-xl p-5 transition-all ${
                    b.Status === 'cancelled' ? 'border-gray-100 opacity-70' : 'border-gray-200'
                  }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Left - Warehouse + renter info */}
                    <div className="flex items-start gap-3 text-right">
                      <div className="w-10 h-10 rounded-lg bg-[#f0f4f8] border border-gray-200 flex items-center justify-center shrink-0">
                        <Building2 size={18} className="text-[#1a3a5c]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {b.warehouse?.Name || `مستودع #${b.WarehouseID}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Users size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {b.renter_company?.CompanyName || `شركة #${b.CompanyName}`}
                          </p>
                        </div>
                        {b.renter_company?.CommercialRegistration && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            سجل تجاري: {b.renter_company.CommercialRegistration}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right - Status + amount */}
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${status.className}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                      <span className="font-black text-gray-900 text-sm">
                        {parseFloat(b.TotalPrice).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 mr-1">ر.س</span>
                      </span>
                    </div>
                  </div>

                  {/* Dates + ID */}
                  <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-50 gap-2">
                    <p className="text-xs text-gray-400 font-mono">#{b.BookingID}</p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <Calendar size={11} className="text-gray-400 shrink-0" />
                      <span className="font-mono">{b.StartDate}</span>
                      <span className="text-gray-300 mx-1">←</span>
                      <span className="font-mono">{b.EndDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="text-left pt-2">
              <p className="text-xs text-gray-400">{filtered.length} حجز</p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-12 py-5 bg-white">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default OwnerBookingsPage;
