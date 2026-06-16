import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, Square, CreditCard, Loader, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const statusStyles = {
  confirmed: { bg: '#ecfdf5', color: '#059669', dot: '#10b981', label: 'مؤكد' },
  pending:   { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'قيد الانتظار' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444', label: 'ملغي' },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>
        <Navbar />
        <div className="flex justify-center items-center" style={{ height: '70vh' }}>
          <Loader size={22} color="#cbd5e1" className="animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center text-center" style={{ height: '70vh' }}>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>{error}</p>
          <button onClick={() => navigate('/bookings')} style={{ marginTop: 16, fontSize: 13, color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            الرجوع للحجوزات
          </button>
        </div>
      </div>
    );
  }

  const days = Math.ceil((new Date(booking.EndDate) - new Date(booking.StartDate)) / 86400000) + 1;
  const status = statusStyles[booking.Status] || statusStyles.pending;

  return (
    <div className="min-h-screen bg-[#fafafa]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      <main className="max-w-2xl mx-auto px-5 py-10">

        {/* رجوع */}
        <button onClick={() => navigate('/bookings')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 28, fontFamily: 'inherit', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#475569'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
          <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
          الحجوزات
        </button>

        {/* رأس الصفحة: المستودع + الحالة */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, fontWeight: 600, color: status.color,
            background: status.bg, padding: '5px 12px', borderRadius: 100,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot }} />
            {status.label}
          </span>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 24, color: '#0f172a', lineHeight: 1.3 }}>
              {booking.warehouse?.Name || `حجز #${id}`}
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>#{id}</p>
          </div>
        </div>

        {/* صورة المستودع */}
        {booking.warehouse?.ImagePath && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, height: 200 }}>
            <img src={booking.warehouse.ImagePath} alt={booking.warehouse.Name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* الفترة — العنصر الأهم بصرياً */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a' }}>
                {booking.EndDate}
              </p>
              <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>النهاية</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
              <div style={{ width: '100%', height: 1, background: '#e2e8f0', position: 'relative' }} />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, fontWeight: 600 }}>{days} يوم</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a' }}>
                {booking.StartDate}
              </p>
              <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>البداية</p>
            </div>
          </div>
        </div>

        {/* بيانات المستودع — مدمجة بدون عناوين */}
        {booking.warehouse && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                <MapPin size={14} />
                <span style={{ fontSize: 13.5, color: '#475569' }}>{booking.warehouse.Location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                <Square size={14} />
                <span style={{ fontSize: 13.5, color: '#475569' }}>{booking.warehouse.Size?.toLocaleString()} م²</span>
              </div>
            </div>
          </div>
        )}

        {/* المبلغ والدفع — بطاقة واحدة بارزة */}
        <div style={{ background: '#0d1b3e', borderRadius: 16, padding: '24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -60, left: -60, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(37,99,235,0.35), transparent 70%)', pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              {payment ? (
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
                  background: payment.Status === 'paid' ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
                  color: payment.Status === 'paid' ? '#6ee7b7' : '#fbbf24',
                }}>
                  {payment.Status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                </span>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(239,68,68,0.18)', color: '#fca5a5' }}>
                  بلا دفع
                </span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1 }}>
                {parseFloat(booking.TotalPrice).toLocaleString()}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginRight: 4 }}>ر.س</span>
              </p>
            </div>
          </div>

          {payment && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{payment.PaymentDate}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)' }}>
                <CreditCard size={13} />
                <span style={{ fontSize: 12.5 }}>{payment.PaymentMethod || 'بطاقة ائتمانية'}</span>
              </div>
            </div>
          )}
        </div>

        {/* تفصيل العمولة — صغير وغير مزاحم */}
        {payment && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px' }}>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>
              صافي للمالك <b style={{ color: '#94a3b8' }}>{parseFloat(payment.net_amount).toLocaleString()} ر.س</b>
            </span>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>
              عمولة المنصة <b style={{ color: '#94a3b8' }}>{parseFloat(payment.commission_amount).toLocaleString()} ر.س</b>
            </span>
          </div>
        )}

      </main>
    </div>
  );
}

export default BookingDetailPage;