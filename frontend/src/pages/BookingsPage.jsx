import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Calendar, CreditCard, Loader, Layers, X, AlertTriangle } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

const API_URL = 'https://api.rafdi.com';

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

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchBookings = async () => {
  try {
    const res = await fetch(`${API_URL}/bookings/my`, { headers: { 'Authorization': `Bearer ${token}` } });
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
        headers,
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
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
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
          <h1 className="text-xl font-black text-white mb-1">حجوزاتي</h1>
          <p className="text-blue-200 text-sm">متابعة جميع حجوزاتك وحالة الدفع</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} className="text-[#1a3a5c] animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Layers size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium mb-4">لا توجد حجوزات حتى الآن</p>
            <button onClick={() => navigate('/home')}
              className="px-4 py-2 bg-[#1a3a5c] text-white text-sm font-bold rounded-lg hover:bg-[#14304e] transition-colors">
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
                        b.Status === 'cancelled' ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-[#1a3a5c]'
                  }`}>

                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      {/* Warehouse info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f0f4f8] border border-gray-200 flex items-center justify-center shrink-0">
                          <Building2 size={18} className="text-[#1a3a5c]" />
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">
                            {b.warehouse?.Name || `مستودع #${b.WarehouseID}`}
                          </p>
                          {b.warehouse?.Location && (
                            <p className="text-xs text-gray-400 mt-0.5">{b.warehouse.Location}</p>
                          )}
                        </div>
                      </div>

                      {/* Badges + amount */}
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${status.className}`}>
                          {status.label}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 ${payment.className}`}>
                          <CreditCard size={11} />
                          {payment.label}
                        </span>
                        <span className="font-black text-gray-900 text-sm">
                          {parseFloat(b.TotalPrice).toLocaleString()}
                          <span className="text-xs font-normal text-gray-400 mr-1">ر.س</span>
                        </span>
                      </div>
                    </div>

                    {/* Dates + booking ID */}
                    <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-50 gap-2">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <span className="text-gray-300">#</span>
                        <span className="font-mono">{b.BookingID}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar size={11} className="text-gray-400 shrink-0" />
                        <span className="font-mono">{b.StartDate}</span>
                        <span className="text-gray-300 mx-1">←</span>
                        <span className="font-mono">{b.EndDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancel button — only for pending */}
                  {canCancel(b) && (
                    <div className="px-5 pb-4">
                      {cancelError && cancellingId === null && confirmCancel === b.BookingID && (
                        <p className="text-xs text-red-600 font-semibold text-right mb-2">{cancelError}</p>
                      )}
                      {confirmCancel === b.BookingID ? (
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-xs text-gray-500 font-medium">هل أنت متأكد من إلغاء الحجز؟</p>
                          <button onClick={() => setConfirmCancel(null)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            لا
                          </button>
                          <button onClick={() => handleCancel(b.BookingID)} disabled={isCancelling}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5">
                            {isCancelling ? (
                              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin block" />
                            ) : <X size={12} />}
                            نعم، إلغاء الحجز
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
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

            {/* Summary footer */}
            <div className="flex justify-between items-center pt-2 text-right">
              <span className="text-xs text-gray-400">
                {bookings.filter(b => b.Status === 'confirmed').length} مؤكد •{' '}
                {bookings.filter(b => b.Status === 'pending').length} قيد الانتظار •{' '}
                {bookings.filter(b => b.Status === 'cancelled').length} ملغي
              </span>
              <span className="text-xs text-gray-400">{bookings.length} حجز إجمالاً</span>
            </div>
          </div>
        )}
      </main>

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmCancel(null)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 p-5 text-right">
            <div className="flex items-center justify-end gap-2 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">إلغاء الحجز</h3>
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              هل أنت متأكد من إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            {cancelError && <p className="text-xs text-red-600 font-semibold mb-3">{cancelError}</p>}
            <div className="flex gap-2">
              <button onClick={() => handleCancel(confirmCancel)} disabled={!!cancellingId}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                {cancellingId ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                ) : null}
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

      <footer className="border-t border-gray-200 mt-12 py-5 bg-white">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default BookingsPage;
