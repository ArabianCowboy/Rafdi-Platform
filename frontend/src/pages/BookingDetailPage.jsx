import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const statusConfig = {
  confirmed: { label: 'مؤكد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  pending:   { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};

const paymentStatusConfig = {
  paid:    { label: 'مدفوع', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'غير مدفوع', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  failed:  { label: 'فشل', className: 'bg-red-50 text-red-600 border border-red-200' },
};

function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await fetch(`${API_URL}/bookings/my`, { headers: getHeaders(false) });
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const found = bookings.find(b => b.BookingID === parseInt(id));
          if (found) setBooking(found);
          else { setError('الحجز غير موجود'); return; }
        }
        const paymentRes = await fetch(`${API_URL}/payments/${id}`, { headers: getHeaders(false) });
        if (paymentRes.ok) setPayment(await paymentRes.json());
      } catch {
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const days = booking
    ? Math.ceil((new Date(booking.EndDate) - new Date(booking.StartDate)) / 86400000)
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {/* Page header */}
      <div style={{ background: '#0d1b3e' }} className="py-8 px-4">
        <div className="max-w-3xl mx-auto text-right">
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 4 }}>
            تفاصيل الحجز
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 14, fontFamily: 'monospace' }}>#{id}</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} color="#2563eb" className="animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Booking Status */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${statusConfig[booking.Status]?.className}`}>
                  {booking.Status === 'confirmed' ? <CheckCircle size={13} /> : booking.Status === 'pending' ? <Clock size={13} /> : <XCircle size={13} />}
                  {statusConfig[booking.Status]?.label}
                </span>
                <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a' }}>
                  حالة الحجز
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'تاريخ البداية', value: booking.StartDate, mono: true },
                  { label: 'تاريخ النهاية', value: booking.EndDate, mono: true },
                  { label: 'مدة الإيجار', value: `${days} يوم` },
                  { label: 'إجمالي الحجز', value: `${parseFloat(booking.TotalPrice).toLocaleString()} ر.س`, blue: true },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-right">
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{item.label}</p>
                    <p style={{
                      fontWeight: 700, fontSize: 14,
                      color: item.blue ? '#2563eb' : '#0f172a',
                      fontFamily: item.mono ? 'monospace' : 'inherit',
                    }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warehouse Info */}
            {booking.warehouse && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                {booking.warehouse.ImagePath ? (
                  <img src={booking.warehouse.ImagePath} alt={booking.warehouse.Name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="h-44 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                    <Building2 size={40} color="#cbd5e1" />
                  </div>
                )}
                <div className="p-5 text-right">
                  <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 14 }}>
                    بيانات المستودع
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'الاسم', value: booking.warehouse.Name },
                      { label: 'الموقع', value: booking.warehouse.Location, icon: <MapPin size={13} color="#94a3b8" /> },
                      { label: 'المساحة', value: `${booking.warehouse.Size?.toLocaleString()} م²`, icon: <Package size={13} color="#94a3b8" /> },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-1.5">
                          {item.icon}
                          <span style={{ fontSize: 14, color: '#475569' }}>{item.value}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.label}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>
                        {parseFloat(booking.warehouse.PricePerDay).toLocaleString()} ر.س/يوم
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>السعر اليومي</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 16 }}>
                بيانات الدفع
              </h3>
              {payment ? (
                <div className="space-y-0 divide-y divide-gray-50">
                  <div className="flex justify-between items-center py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${paymentStatusConfig[payment.Status]?.className}`}>
                      {paymentStatusConfig[payment.Status]?.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>حالة الدفع</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {parseFloat(payment.Amount).toLocaleString()} ر.س
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>المبلغ المدفوع</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span style={{ fontSize: 14, color: '#475569', fontFamily: 'monospace' }}>{payment.PaymentDate}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>تاريخ الدفع</span>
                  </div>
                  {payment.PaymentMethod && (
                    <div className="flex justify-between items-center py-3">
                      <span style={{ fontSize: 14, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CreditCard size={13} color="#94a3b8" />
                        {payment.PaymentMethod}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>طريقة الدفع</span>
                    </div>
                  )}
                  {payment.MoyasarPaymentID && (
                    <div className="flex justify-between items-center py-3">
                      <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{payment.MoyasarPaymentID}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم العملية</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-right">
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>عمولة المنصة</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {parseFloat(payment.commission_amount).toLocaleString()} ر.س
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-right">
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>صافي المبلغ</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {parseFloat(payment.net_amount).toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl border border-dashed border-gray-200" style={{ background: '#f8fafc' }}>
                  <CreditCard size={28} color="#cbd5e1" className="mx-auto mb-2" />
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>لا يوجد دفع مسجل لهذا الحجز</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-5 text-center">
          <span style={{ color: '#64748b', fontSize: 13 }}>© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default BookingDetailPage;