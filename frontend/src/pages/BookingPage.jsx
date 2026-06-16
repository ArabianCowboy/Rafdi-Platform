import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, CheckCircle, ChevronLeft, ChevronRight, Loader, MapPin, Package, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders, apiFetch } from '../config/api';

const today = new Date();
today.setHours(0, 0, 0, 0);

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [range, setRange] = useState({ from: undefined, to: undefined });

  // بيانات الحجز بعد النجاح
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, datesRes] = await Promise.all([
          apiFetch(`${API_URL}/warehouses/${id}`, { headers: getHeaders(false) }),
          apiFetch(`${API_URL}/bookings/booked-dates/${id}`, { headers: getHeaders(false) }),
        ]);
        if (!warehouseRes.ok) throw new Error();
        setWarehouse(await warehouseRes.json());
        if (datesRes.ok) setBookedDates(await datesRes.json());
      } catch {
        setError('حدث خطأ في تحميل بيانات المستودع');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const disabledDays = [
    { before: today },
    ...bookedDates.map(({ start, end }) => ({ from: new Date(start), to: new Date(end) }))
  ];

  const days = range?.from && range?.to ? Math.ceil((range.to - range.from) / 86400000) + 1 : 0;
  const basePrice = days > 0 && warehouse ? Math.ceil(days * warehouse.PricePerDay) : 0;
  const commission = Math.ceil(basePrice * 0.05);
  const totalPrice = basePrice + commission;
  const startDate = range?.from?.toISOString().split('T')[0];
  const endDate = range?.to?.toISOString().split('T')[0];

  const parseError = (detail) => {
    if (!detail) return 'حدث خطأ';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(e => e.msg).join(', ');
    return 'حدث خطأ';
  };

const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    if (!range?.from) { setError('يرجى اختيار تاريخ البداية'); return; }
    if (!range?.to) { setError('يرجى اختيار تاريخ النهاية، لا يمكن الحجز بيوم واحد فقط'); return; }
    if (range.to <= range.from) { setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية'); return; }

    setSubmitting(true);
    try {
      const res = await apiFetch(`${API_URL}/bookings/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ WarehouseID: parseInt(id), StartDate: startDate, EndDate: endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 403 ? 'الحجز متاح للمستأجرين فقط' : parseError(data.detail));
        return;
      }
      // حفظ بيانات الحجز وعرض شاشة التأكيد
      setBookingResult({
        bookingId: data.BookingID,
        warehouseName: warehouse.Name,
        startDate,
        endDate,
        days,
        totalPrice: parseFloat(data.TotalPrice) || totalPrice,
      });
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToPayment = () => {
    navigate('/payment', {
      state: {
        bookingId: bookingResult.bookingId,
        warehouseName: bookingResult.warehouseName,
        estimatedPrice: bookingResult.totalPrice,
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader size={28} color="#2563eb" className="animate-spin" />
        </div>
      ) : error && !warehouse ? (
        <div className="text-center py-32">
          <p className="text-red-500 text-sm font-semibold">{error}</p>
        </div>
      ) : bookingResult ? (

        /* ===== شاشة تأكيد الحجز ===== */
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-right"
            style={{ boxShadow: '0 4px 24px -8px rgba(15,23,42,0.12)' }}>

            {/* Header أخضر */}
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} color="#fff" />
              </div>
              <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 6 }}>
                تم الحجز بنجاح!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                يرجى إتمام الدفع لتأكيد حجزك
              </p>
            </div>

            {/* بيانات الحجز */}
            <div style={{ padding: '24px 28px' }}>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 14 }}>
                  تفاصيل الحجز
                </h3>

                <div className="space-y-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>المستودع</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{bookingResult.warehouseName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>الفترة</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="#94a3b8" />
                      <span style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>
                        {bookingResult.startDate} ← {bookingResult.endDate}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>المدة</span>
                    <span style={{ fontSize: 13, color: '#475569' }}>{bookingResult.days} يوم</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم الحجز</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>#{bookingResult.bookingId}</span>
                  </div>
                </div>
              </div>

              {/* المبلغ */}
              <div style={{ background: '#eff6ff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>المبلغ المطلوب</span>
                <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#2563eb' }}>
                  {bookingResult.totalPrice.toLocaleString()} ر.س
                </span>
              </div>

              {/* زر الدفع */}
<button onClick={handleGoToPayment}
  style={{
    width: '100%', padding: '14px 16px', borderRadius: 10,
    background: '#2563eb', color: '#fff',
    fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16,
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    boxShadow: '0 8px 20px -8px rgba(37,99,235,0.6)',
    marginBottom: 12,
  }}>
  <CreditCard size={18} />
  الانتقال إلى الدفع
  <ArrowLeft size={16} />
</button>

<p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 14 }}>
  يجب إتمام الدفع لتأكيد الحجز
</p>
            </div>
          </div>
        </div>

      ) : (

        /* ===== صفحة الحجز الأصلية ===== */
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div className="h-48 relative bg-gray-100">
                  {warehouse?.ImagePath ? (
                    <img src={warehouse.ImagePath} alt={warehouse.Name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={40} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      warehouse?.IsActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {warehouse?.IsActive ? 'متاح' : 'غير متاح'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
                    <p className="text-white font-bold text-base leading-none">
                      {warehouse?.PricePerDay?.toLocaleString()}
                      <span className="text-white/70 text-xs font-normal mr-1">ر.س / يوم</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 text-right">
                  <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 17, color: '#0f172a', marginBottom: 10 }}>
                    {warehouse?.Name}
                  </h2>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-start gap-1.5 text-gray-500 text-sm">
                      <span>{warehouse?.Location}</span>
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                    </div>
                    <div className="flex items-center justify-start gap-1.5 text-gray-500 text-sm">
                      <span>{warehouse?.Size?.toLocaleString()} م²</span>
                      <Package size={13} className="text-gray-400 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-right" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <h4 className="text-xs font-bold text-gray-600 mb-3">دليل التقويم</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-start gap-2 text-xs text-gray-500">
                    <span>غير متاح</span>
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                  </div>
                  <div className="flex items-center justify-start gap-2 text-xs text-gray-500">
                    <span>متاح</span>
                    <div className="w-4 h-4 rounded" style={{ background: '#2563eb' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div className="px-5 py-4 border-b border-gray-100 text-right">
                  <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 18, color: '#0f172a' }}>إتمام الحجز</h3>
                  <p className="text-xs text-gray-500 mt-0.5">اختر فترة الإيجار من التقويم</p>
                </div>

                <div className="p-5">
                  {error && (
                    <div className="mb-4 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-red-50 border border-red-200">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-black">!</span>
                      </div>
                      <p className="font-semibold text-red-700 text-right leading-relaxed">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleBooking} className="space-y-4">
                    {(range?.from || range?.to) && (
                      <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-right">
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-gray-700 font-bold">{startDate}</span>
                          <span className="text-gray-300">←</span>
                          <span className="text-gray-500">{range?.to ? endDate : '...'}</span>
                        </div>
                        <button type="button" onClick={() => setRange({ from: undefined, to: undefined })}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                          مسح
                        </button>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <style>{`
                        .rdp-root { font-family: 'IBM Plex Sans Arabic', sans-serif; }
                        .rdp-disabled .rdp-day_button { background-color: #fee2e2 !important; color: #ef4444 !important; text-decoration: line-through !important; opacity: 1 !important; border-radius: 4px; cursor: not-allowed; }
                        .rdp-selected .rdp-day_button,
                        .rdp-range_start .rdp-day_button,
                        .rdp-range_end .rdp-day_button { background-color: #2563eb !important; color: white !important; border-radius: 4px; }
                        .rdp-range_middle .rdp-day_button { background-color: #eff6ff !important; color: #2563eb !important; }
                        .rdp-day_button:hover:not([disabled]) { background-color: #eff6ff; border-radius: 4px; }
                        .rdp-weekday { color: #64748b; font-size: 0.75rem; }
                        .rdp-caption_label { color: #0f172a; font-weight: 800; font-family: 'IBM Plex Sans Arabic', sans-serif; }
                        .rdp-button_previous, .rdp-button_next { color: #2563eb; }
                      `}</style>
                      <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                        disabled={disabledDays}
                        numberOfMonths={1}
                        showOutsideDays={false}
                        components={{
                          Chevron: ({ orientation }) =>
                            orientation === 'left'
                              ? <ChevronRight size={16} />
                              : <ChevronLeft size={16} />
                        }}
                      />
                    </div>

                    {days > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-600 text-right">ملخص التكلفة</p>
                        </div>
                        <div className="px-4 py-3 space-y-2.5 text-right">
                          <div className="flex justify-between items-center gap-4 text-sm">
                            <span className="text-gray-500 text-xs">{days} يوم × {warehouse?.PricePerDay?.toLocaleString()} ر.س</span>
                            <span className="font-semibold text-gray-900">{basePrice.toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center gap-4 text-sm">
                            <span className="text-gray-500 text-xs">رسوم المنصة (5%)</span>
                            <span className="font-semibold" style={{ color: '#2563eb' }}>+{commission.toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center gap-4 pt-2.5 border-t border-gray-200">
                            <span className="text-xs font-bold text-gray-500">الإجمالي</span>
                            <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 18, color: '#0f172a' }}>
                              {totalPrice.toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {days > 0 && (
                      <div className="flex items-center justify-between text-xs rounded-xl px-4 py-2.5"
                        style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                        <span className="text-gray-500">مدة الحجز</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>{days} يوم</span>
                      </div>
                    )}

                    <button type="submit" disabled={submitting || !range?.from || !range?.to}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 9,
                        background: submitting || !range?.from || !range?.to ? '#93c5fd' : '#2563eb',
                        color: '#fff', fontWeight: 700, fontSize: 14.5,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 8px 18px -8px rgba(37,99,235,0.6)',
                      }}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                          جاري تأكيد الحجز...
                        </span>
                      ) : (
                        <>
                          <CheckCircle size={15} />
                          {days > 0 ? `تأكيد الحجز — ${totalPrice.toLocaleString()} ر.س` : 'اختر فترة الحجز'}
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                      ستظهر لك بيانات الحجز قبل الانتقال للدفع
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;
