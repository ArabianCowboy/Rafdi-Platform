import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, CreditCard, Loader, Layers, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders, apiFetch } from '../config/api';

const statusConfig = {
  confirmed: { label: 'مؤكد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending:   { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-600 border border-red-200' },
};

const paymentConfig = {
  confirmed: { label: 'مدفوع', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending:   { label: 'غير مدفوع', className: 'bg-gray-100 text-gray-600 border border-gray-200' },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-500 border border-red-100' },
};

const getOwnerCompanyName = (booking) =>
  booking.warehouse?.company?.CompanyName ||
  booking.warehouse?.company?.Name ||
  booking.warehouse?.company?.name ||
  booking.warehouse?.company?.company_name ||
  booking.warehouse?.company?.companyName ||
  booking.warehouse?.CompanyName ||
  booking.warehouse?.company_name ||
  booking.warehouse?.companyName ||
  booking.owner_company?.CompanyName ||
  booking.owner_company?.Name ||
  booking.owner_company?.name ||
  booking.owner_company?.company_name ||
  booking.ownerCompany?.CompanyName ||
  booking.ownerCompany?.Name ||
  booking.company?.CompanyName ||
  booking.company?.Name ||
  booking.company?.name ||
  booking.company?.company_name ||
  booking.OwnerCompanyName ||
  booking.CompanyName ||
  booking.company_name ||
  booking.companyName ||
  'شركة غير محددة';

function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await apiFetch(`${API_URL}/bookings/my`, { headers: getHeaders(false) });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.reverse());
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      <div
        className="px-4 py-8"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          borderBottom: '1px solid #dbeafe',
        }}
      >
        <div className="max-w-5xl mx-auto text-right">
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: '#0f172a', marginBottom: 4 }}>حجوزاتي</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>متابعة جميع حجوزاتك وحالة الدفع</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} color="#2563eb" className="animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Layers size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium mb-4">لا توجد حجوزات حتى الآن</p>
            <button onClick={() => navigate('/home')}
              style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: 9, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              ابحث عن مستودع
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const status = statusConfig[b.Status] || statusConfig.pending;
              const payment = paymentConfig[b.Status] || paymentConfig.pending;
              const warehouse = b.warehouse;
              const imageUrl = warehouse?.ImagePath;
              const ownerCompanyName = getOwnerCompanyName(b);

              return (
                <div key={b.BookingID}
                  onClick={() => navigate(`/booking-detail/${b.BookingID}`)}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer ${
                    b.Status === 'cancelled' ? 'border-gray-100 opacity-70' : 'border-gray-200'
                  }`}
                  style={{ boxShadow: '0 12px 32px -26px rgba(15,23,42,0.55)' }}
                  onMouseEnter={e => { if (b.Status !== 'cancelled') e.currentTarget.style.borderColor = '#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = b.Status === 'cancelled' ? '#f3f4f6' : '#e2e8f0'; }}
                >
                  <div className="flex flex-col md:flex-row" dir="rtl">
                    <div className="relative h-44 md:h-auto md:w-52 shrink-0 bg-gray-100 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={warehouse?.Name || 'المستودع'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50">
                          <Building2 size={38} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 text-right">
                          <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                            {warehouse?.Name || `مستودع #${b.WarehouseID}`}
                          </p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
                            {ownerCompanyName}
                          </p>
                          {warehouse?.Location && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                              <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
                              <span className="leading-5">{warehouse.Location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-row-reverse items-center justify-between gap-3 md:flex-col md:items-end">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${status.className}`}>
                              {status.label}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 ${payment.className}`}>
                              <CreditCard size={11} />
                              {payment.label}
                            </span>
                          </div>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{bookings.length} حجز إجمالاً</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {bookings.filter(b => b.Status === 'confirmed').length} مؤكد •{' '}
                {bookings.filter(b => b.Status === 'pending').length} قيد الانتظار •{' '}
                {bookings.filter(b => b.Status === 'cancelled').length} ملغي
              </span>
            </div>
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

export default BookingsPage;
