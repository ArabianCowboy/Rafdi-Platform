import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, CreditCard, Loader, Layers, X, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

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

function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelError, setCancelError] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/my`, { headers: getHeaders(false) });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.reverse());
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    setCancelError('');
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ Status: 'cancelled' })
      });
      if (res.ok) {
        setConfirmCancel(null);
        fetchBookings();
      } else {
        const data = await res.json();
        setCancelError(data.detail || 'حدث خطأ أثناء الإلغاء');
      }
    } catch {
      setCancelError('حدث خطأ في الاتصال');
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (booking) => booking.Status === 'pending';

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      <div style={{ background: '#0d1b3e' }} className="py-8 px-4">
        <div className="max-w-5xl mx-auto text-right">
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 4 }}>حجوزاتي</h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 15 }}>متابعة جميع حجوزاتك وحالة الدفع</p>
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
          <div className="space-y-3">
            {bookings.map((b) => {
              const status = statusConfig[b.Status] || statusConfig.pending;
              const payment = paymentConfig[b.Status] || paymentConfig.pending;
              const isCancelling = cancellingId === b.BookingID;

              return (
                <div key={b.BookingID}
                  onClick={() => navigate(`/booking-detail/${b.BookingID}`)}
                  className={`bg-white border rounded-xl overflow-hidden transition-all cursor-pointer ${
                    b.Status === 'cancelled' ? 'border-gray-100 opacity-70' : 'border-gray-200'
                  }`}
                  style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                  onMouseEnter={e => { if (b.Status !== 'cancelled') e.currentTarget.style.borderColor = '#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = b.Status === 'cancelled' ? '#f3f4f6' : '#e2e8f0'; }}
                >
                  <div className="p-5" dir="rtl">

                    {/* Row 1: warehouse info يمين — badges يسار */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>

                      {/* يمين — بيانات المستودع */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', border: '1px solid #dbeafe', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Building2 size={18} color="#2563eb" />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                            {b.warehouse?.Name || `مستودع #${b.WarehouseID}`}
                          </p>
                          {b.warehouse?.company?.CompanyName && (
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', marginTop: 2 }}>
                              {b.warehouse.company.CompanyName}
                            </p>
                          )}
                          {b.warehouse?.Location && (
                            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{b.warehouse.Location}</p>
                          )}
                        </div>
                      </div>

                      {/* يسار — badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${status.className}`}>
                          {status.label}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 ${payment.className}`}>
                          <CreditCard size={11} />
                          {payment.label}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: المبلغ */}
                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                      <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                        {parseFloat(b.TotalPrice).toLocaleString()}
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8', marginRight: 4 }}>ر.س</span>
                      </span>
                    </div>

                    {/* Row 3: التواريخ + الرقم */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f8fafc' }}>
                      <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{b.BookingID}#</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                        <Calendar size={11} color="#94a3b8" />
                        <span style={{ fontFamily: 'monospace' }}>{b.StartDate}</span>
                        <span style={{ color: '#cbd5e1' }}>←</span>
                        <span style={{ fontFamily: 'monospace' }}>{b.EndDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* زر الإلغاء */}
                  {canCancel(b) && (
                    <div className="px-5 pb-4" dir="rtl" onClick={e => e.stopPropagation()}>
                      {cancelError && cancellingId === null && confirmCancel === b.BookingID && (
                        <p className="text-xs text-red-600 font-semibold text-right mb-2">{cancelError}</p>
                      )}
                      {confirmCancel === b.BookingID ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, direction: 'rtl' }}>
                          <button onClick={() => handleCancel(b.BookingID)} disabled={isCancelling}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5">
                            {isCancelling ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" /> : <X size={12} />}
                            نعم، إلغاء
                          </button>
                          <button onClick={() => setConfirmCancel(null)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            لا
                          </button>
                          <p className="text-xs text-gray-500 font-medium">هل أنت متأكد؟</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', direction: 'rtl' }}>
                          <button onClick={() => { setConfirmCancel(b.BookingID); setCancelError(''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                            <X size={12} />
                            إلغاء الحجز
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* Cancel modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmCancel(null)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 p-5" dir="rtl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">إلغاء الحجز</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              هل أنت متأكد من إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            {cancelError && <p className="text-xs text-red-600 font-semibold mb-3">{cancelError}</p>}
            <div className="flex gap-2">
              <button onClick={() => handleCancel(confirmCancel)} disabled={!!cancellingId}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                {cancellingId ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : null}
                نعم، إلغاء
              </button>
              <button onClick={() => { setConfirmCancel(null); setCancelError(''); }}
                className="flex-1 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-5 text-center">
          <span style={{ color: '#64748b', fontSize: 13 }}>© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default BookingsPage;