import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, Package, CreditCard, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const statusConfig = {
  confirmed: { label: 'مؤكد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending:   { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-600 border border-red-200' },
};

const paymentStatusConfig = {
  paid:    { label: 'مدفوع', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'غير مدفوع', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  failed:  { label: 'فشل', className: 'bg-red-50 text-red-600 border border-red-200' },
};

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
    <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0, marginRight: 8 }}>{label}</span>
  </div>
);

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

      <div style={{ background: '#0d1b3e' }} className="py-8 px-4">
        <div className="max-w-3xl mx-auto" style={{ textAlign: 'right' }}>
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

            {/* حالة الحجز */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }} dir="rtl">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${statusConfig[booking.Status]?.className}`}>
                  {booking.Status === 'confirmed' ? <CheckCircle size={13} /> : booking.Status === 'pending' ? <Clock size={13} /> : <XCircle size={13} />}
                  {statusConfig[booking.Status]?.label}
                </span>
                <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a' }}>
                  حالة الحجز
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, direction: 'rtl' }}>
                {[
                  { label: 'تاريخ البداية', value: booking.StartDate, mono: true },
                  { label: 'تاريخ النهاية', value: booking.EndDate, mono: true },
                  { label: 'مدة الإيجار', value: `${days} يوم` },
                  { label: 'إجمالي الحجز', value: `${parseFloat(booking.TotalPrice).toLocaleString()} ر.س`, blue: true },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'right' }}>
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

            {/* بيانات المستودع */}
            {booking.warehouse && (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                {booking.warehouse.ImagePath ? (
                  <img src={booking.warehouse.ImagePath} alt={booking.warehouse.Name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="h-44 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                    <Building2 size={40} color="#cbd5e1" />
                  </div>
                )}
                <div style={{ padding: 20 }} dir="rtl">
                  <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 14 }}>
                    بيانات المستودع
                  </h3>
                  <Row label="الاسم">
                    <span style={{ fontSize: 14, color: '#475569' }}>{booking.warehouse.Name}</span>
                  </Row>
                  <Row label="الموقع">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="#94a3b8" />
                      <span style={{ fontSize: 14, color: '#475569' }}>{booking.warehouse.Location}</span>
                    </div>
                  </Row>
                  <Row label="المساحة">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Package size={13} color="#94a3b8" />
                      <span style={{ fontSize: 14, color: '#475569' }}>{booking.warehouse.Size?.toLocaleString()} م²</span>
                    </div>
                  </Row>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 11 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>
                      {parseFloat(booking.warehouse.PricePerDay).toLocaleString()} ر.س/يوم
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>السعر اليومي</span>
                  </div>
                </div>
              </div>
            )}

            {/* بيانات الدفع */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }} dir="rtl">
              <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 16 }}>
                بيانات الدفع
              </h3>
              {payment ? (
                <div>
                  <Row label="حالة الدفع">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${paymentStatusConfig[payment.Status]?.className}`}>
                      {paymentStatusConfig[payment.Status]?.label}
                    </span>
                  </Row>
                  <Row label="المبلغ المدفوع">
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {parseFloat(payment.Amount).toLocaleString()} ر.س
                    </span>
                  </Row>
                  <Row label="تاريخ الدفع">
                    <span style={{ fontSize: 14, color: '#475569', fontFamily: 'monospace' }}>{payment.PaymentDate}</span>
                  </Row>
                  {payment.PaymentMethod && (
                    <Row label="طريقة الدفع">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CreditCard size={13} color="#94a3b8" />
                        <span style={{ fontSize: 14, color: '#475569' }}>{payment.PaymentMethod}</span>
                      </div>
                    </Row>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, direction: 'rtl', paddingTop: 12 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>عمولة المنصة</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {parseFloat(payment.commission_amount).toLocaleString()} ر.س
                      </p>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'right' }}>
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