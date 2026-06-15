import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Loader, Lock, CreditCard, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const MOYASAR_KEY = import.meta.env.VITE_MOYASAR_KEY || 'pk_test_xZj2Ucqc3pVSkktyUTZLs1ER6JhSKxj4Pnwvt8Ds';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const processingRef = useRef(false);

  const bookingIdFromState = location.state?.bookingId;
  const warehouseNameFromState = location.state?.warehouseName;
  const estimatedPriceFromState = location.state?.estimatedPrice;

  if (bookingIdFromState) {
    localStorage.setItem('paymentBookingId', bookingIdFromState);
    localStorage.setItem('paymentWarehouseName', warehouseNameFromState || 'المستودع');
    localStorage.setItem('paymentEstimatedPrice', estimatedPriceFromState || 0);
  }

  // ثابتة بعد أول render — لا تتأثر بتغيّر location.state بعد ذلك
  const [bookingId] = useState(() => bookingIdFromState || localStorage.getItem('paymentBookingId'));
  const [warehouseName] = useState(() => warehouseNameFromState || localStorage.getItem('paymentWarehouseName') || 'المستودع');
  const [estimatedPrice] = useState(() => parseFloat(estimatedPriceFromState || localStorage.getItem('paymentEstimatedPrice') || 0));

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const processBackendPayment = async (moyasarPaymentId, moyasarStatus, paymentMethod) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    try {
      const currentBookingId = bookingId;
      const params = new URLSearchParams({
        booking_id: currentBookingId,
        moyasar_payment_id: moyasarPaymentId,
        moyasar_status: moyasarStatus,
        payment_method: paymentMethod || 'creditcard',
      });
      const res = await fetch(`${API_URL}/payments/?${params}`, {
        method: 'POST',
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'حدث خطأ أثناء تأكيد الدفع'); return; }
      setPaymentData(data);
      setSuccess(true);

      try {
        const bRes = await fetch(`${API_URL}/bookings/my`, { headers: getHeaders(false) });
        if (bRes.ok) {
          const bookings = await bRes.json();
          const found = bookings.find(b => b.BookingID === parseInt(currentBookingId));
          if (found) setBookingDetails(found);
        }
      } catch {}

      localStorage.removeItem('paymentBookingId');
      localStorage.removeItem('paymentWarehouseName');
      localStorage.removeItem('paymentEstimatedPrice');
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  };

  useEffect(() => {
    if (!bookingId) { navigate('/home'); return; }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('id');
    const paymentStatus = urlParams.get('status');
    const sourceType = urlParams.get('source[type]') || urlParams.get('source_type') || 'creditcard';

    if (paymentId && paymentStatus) {
      if (paymentStatus === 'paid') {
        processBackendPayment(paymentId, paymentStatus, sourceType);
      } else {
        setError(`فشل الدفع — الحالة: ${paymentStatus}`);
      }
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
    script.async = true;
    script.onload = () => {
      if (!window.Moyasar) return;
      window.Moyasar.init({
        element: '.moyasar-form-wrapper',
        amount: Math.round(parseFloat(estimatedPrice) * 100),
        currency: 'SAR',
        description: `حجز مستودع: ${warehouseName}`,
        publishable_api_key: MOYASAR_KEY,
        callback_url: window.location.href.split('?')[0],
        methods: ['creditcard', 'applepay'],
        apple_pay: {
          country: 'SA',
          label: 'رفدي - حجز مستودع',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        on_completed: async (payment) => {
          if (payment.status === 'paid') {
            await processBackendPayment(payment.id, payment.status, payment.source?.type);
          }
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">

        {success ? (

          /* ===== شاشة النجاح الكاملة ===== */
          <div className="max-w-lg mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-right"
              style={{ boxShadow: '0 4px 24px -8px rgba(15,23,42,0.12)' }}>

              {/* Header أخضر */}
              <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '32px 28px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={32} color="#fff" />
                </div>
                <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 6 }}>
                  تم الدفع بنجاح!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  تم تأكيد حجزك بنجاح
                </p>
              </div>

              <div style={{ padding: '24px 28px' }}>

                {/* المبلغ */}
                <div style={{ background: '#eff6ff', borderRadius: 12, padding: '20px', marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>المبلغ المدفوع</p>
                  <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 30, color: '#2563eb' }}>
                    {paymentData ? parseFloat(paymentData.Amount).toLocaleString() : estimatedPrice.toLocaleString()}
                    <span style={{ fontSize: 15, fontWeight: 400, color: '#94a3b8', marginRight: 4 }}>ر.س</span>
                  </p>
                </div>

                {/* تفاصيل الحجز */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 14 }}>
                    تفاصيل الحجز
                  </h3>
                  <div className="space-y-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{warehouseName}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>المستودع</span>
                    </div>
                    {bookingDetails && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', direction: 'rtl' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} color="#94a3b8" />
                            <span style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>
                              {bookingDetails.StartDate} ← {bookingDetails.EndDate}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>الفترة</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', direction: 'rtl' }}>
                          <span style={{ fontSize: 13, color: '#475569' }}>
                            {Math.ceil((new Date(bookingDetails.EndDate) - new Date(bookingDetails.StartDate)) / 86400000) + 1} يوم
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>المدة</span>
                        </div>
                      </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', direction: 'rtl' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>#{bookingId}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم الحجز</span>
                    </div>
                  </div>
                </div>

                {/* تفاصيل العملية */}
                {paymentData && (
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 14 }}>
                      تفاصيل العملية
                    </h3>
                    <div className="space-y-3">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
                        <span style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace', fontWeight: 600 }}>
                          #{paymentData.PaymentID}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم العملية</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', direction: 'rtl' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CreditCard size={13} color="#94a3b8" />
                          <span style={{ fontSize: 13, color: '#475569' }}>
                            {paymentData.PaymentMethod || 'بطاقة ائتمانية'}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>طريقة الدفع</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', direction: 'rtl' }}>
                        <span style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>
                          {paymentData.PaymentDate}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>تاريخ الدفع</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', direction: 'rtl' }}>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {paymentData.Status === 'paid' ? 'مدفوع' : paymentData.Status}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>حالة الدفع</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* العمولات */}
                {paymentData && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, direction: 'rtl', marginBottom: 20 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>عمولة المنصة</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {parseFloat(paymentData.commission_amount).toLocaleString()} ر.س
                      </p>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>صافي المبلغ للمالك</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {parseFloat(paymentData.net_amount).toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>
                )}

                {/* زر */}
                <button onClick={() => navigate('/home')}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 10,
                    background: '#2563eb', color: '#fff',
                    fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 15,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 8px 20px -8px rgba(37,99,235,0.6)',
                  }}>
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>

        ) : (

          /* ===== صفحة الدفع ===== */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left - Summary */}
            <div className="lg:col-span-2 space-y-4">

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div className="px-5 py-4 border-b border-gray-100 text-right" style={{ background: '#0d1b3e' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500, marginBottom: 3 }}>ملخص الطلب</p>
                  <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>
                    {warehouseName}
                  </h3>
                </div>
                <div className="p-5 text-right space-y-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
                    <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a' }}>
                      {estimatedPrice.toLocaleString()}
                      <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8', marginRight: 4 }}>ر.س</span>
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>المبلغ الإجمالي</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f5f9', direction: 'rtl' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                      <Lock size={11} />
                      آمن ومشفر
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>حالة الدفع</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4"
                style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, direction: 'rtl' }}>
                  <ShieldCheck size={14} color="#2563eb" />
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>معلومات الأمان</h4>
                </div>
                <div className="space-y-2.5">
                  {[
                    'جميع البيانات مشفرة SSL',
                    'دفع آمن عبر ميسر',
                    'بيانات بطاقتك لا تُخزن',
                    'يدعم Apple Pay',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, direction: 'rtl' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, direction: 'rtl', padding: '0 4px' }}>
                <CreditCard size={13} color="#94a3b8" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Moyasar</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>الدفع مؤمّن عبر</span>
              </div>
            </div>

            {/* Right - Payment Form */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>

                <div className="px-5 py-4 border-b border-gray-100 text-right">
                  <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a' }}>
                    إتمام الدفع
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>ادفع بأمان عبر بوابة ميسر</p>
                </div>

                <div className="p-5">
                  {processing && (
                    <div className="mb-5 p-5 rounded-xl text-center bg-blue-50 border border-blue-100">
                      <Loader size={28} color="#2563eb" className="animate-spin mx-auto mb-2" />
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>جاري تأكيد الدفع...</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>يرجى الانتظار</p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-black">!</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{error}</p>
                    </div>
                  )}

                  {!processing && (
                    <div className="moyasar-form-wrapper" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-5 text-center">
          <span style={{ color: '#64748b', fontSize: 13 }}>© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default PaymentPage;