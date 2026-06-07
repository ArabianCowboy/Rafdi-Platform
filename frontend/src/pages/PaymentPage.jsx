import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Loader, Lock, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const MOYASAR_KEY = 'pk_test_xZj2Ucqc3pVSkktyUTZLs1ER6JhSKxj4Pnwvt8Ds';

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

  const bookingId = bookingIdFromState || localStorage.getItem('paymentBookingId');
  const warehouseName = warehouseNameFromState || localStorage.getItem('paymentWarehouseName') || 'المستودع';
  const estimatedPrice = parseFloat(estimatedPriceFromState || localStorage.getItem('paymentEstimatedPrice') || 0);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const processBackendPayment = async (moyasarPaymentId, moyasarStatus, paymentMethod) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    try {
      const currentBookingId = bookingIdFromState || localStorage.getItem('paymentBookingId');
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
      localStorage.removeItem('paymentBookingId');
      localStorage.removeItem('paymentWarehouseName');
      localStorage.removeItem('paymentEstimatedPrice');
      setTimeout(() => navigate('/home'), 4000);
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
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a' }}>
                    {estimatedPrice.toLocaleString()}
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8', marginRight: 4 }}>ر.س</span>
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>المبلغ الإجمالي</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                    <Lock size={11} />
                    آمن ومشفر
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>حالة الدفع</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div className="flex items-center justify-end gap-2 mb-3">
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>معلومات الأمان</h4>
                <ShieldCheck size={14} color="#2563eb" />
              </div>
              <div className="space-y-2">
                {[
                  'جميع البيانات مشفرة SSL',
                  'دفع آمن عبر ميسر',
                  'بيانات بطاقتك لا تُخزن',
                  'يدعم Apple Pay',
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-end gap-2" style={{ fontSize: 12, color: '#64748b' }}>
                    <span>{item}</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-1">
              <span style={{ fontSize: 12, color: '#94a3b8' }}>الدفع مؤمّن عبر</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Moyasar</span>
              <CreditCard size={13} color="#94a3b8" />
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

                {success && (
                  <div className="p-6 rounded-xl text-center bg-emerald-50 border border-emerald-200">
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#d1fae5', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                      <CheckCircle size={26} color="#10b981" />
                    </div>
                    <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 17, color: '#065f46', marginBottom: 6 }}>
                      تم الدفع بنجاح
                    </p>
                    <p style={{ fontSize: 12, color: '#059669', marginBottom: 18 }}>جاري تحويلك للصفحة الرئيسية...</p>
                    {paymentData && (
                      <div className="bg-white border border-emerald-100 rounded-xl p-3.5 text-right space-y-2">
                        <div className="flex justify-between items-center">
                          <span style={{ fontSize: 12, color: '#059669', fontFamily: 'monospace', fontWeight: 600 }}>
                            #{paymentData.PaymentID}
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم العملية</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                            {paymentData.PaymentMethod || 'بطاقة ائتمانية'}
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>طريقة الدفع</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                          <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                            {parseFloat(paymentData.Amount).toLocaleString()} ر.س
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>المبلغ المدفوع</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!success && !processing && (
                  <div className="moyasar-form-wrapper" />
                )}
              </div>
            </div>
          </div>
        </div>
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