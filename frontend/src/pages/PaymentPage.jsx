import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle, ShieldCheck, Loader, Lock, CreditCard } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';
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
      const token = localStorage.getItem('token');
      const currentBookingId = bookingIdFromState || localStorage.getItem('paymentBookingId');
      const params = new URLSearchParams({
        booking_id: currentBookingId,
        moyasar_payment_id: moyasarPaymentId,
        moyasar_status: moyasarStatus,
        payment_method: paymentMethod || 'creditcard',
      });
      const res = await fetch(`${API_URL}/payments/?${params}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <button onClick={() => navigate(-1)}
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left - Summary (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-[#1a3a5c] text-right">
                <p className="text-blue-200 text-xs font-semibold mb-0.5">ملخص الطلب</p>
                <h3 className="font-bold text-white text-sm">{warehouseName}</h3>
              </div>
              <div className="p-5 text-right space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-gray-900 text-xl">
                    {estimatedPrice.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400 mr-1">ر.س</span>
                  </span>
                  <span className="text-xs text-gray-500">المبلغ الإجمالي</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Lock size={11} />
                    آمن ومشفر
                  </span>
                  <span className="text-gray-400">حالة الدفع</span>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-right">
              <div className="flex items-center justify-end gap-2 mb-3">
                <h4 className="text-xs font-bold text-gray-600">معلومات الأمان</h4>
                <ShieldCheck size={14} className="text-[#1a3a5c]" />
              </div>
              <div className="space-y-2">
                {[
                  'جميع البيانات مشفرة SSL',
                  'دفع آمن عبر ميسر',
                  'بيانات بطاقتك لا تُخزن',
                  'يدعم Apple Pay',
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-end gap-2 text-xs text-gray-500">
                    <span>{item}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Moyasar logo note */}
            <div className="flex items-center justify-end gap-2 px-1">
              <span className="text-xs text-gray-400">الدفع مؤمّن عبر</span>
              <span className="text-xs font-bold text-gray-600">Moyasar</span>
              <CreditCard size={13} className="text-gray-400" />
            </div>
          </div>

          {/* Right - Payment Form (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 text-right">
                <h3 className="font-bold text-gray-900 text-sm">إتمام الدفع</h3>
                <p className="text-xs text-gray-500 mt-0.5">ادفع بأمان عبر بوابة ميسر</p>
              </div>

              <div className="p-5">

                {processing && (
                  <div className="mb-5 p-5 rounded-xl text-center bg-blue-50 border border-blue-100">
                    <Loader size={28} className="text-[#1a3a5c] animate-spin mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#1a3a5c]">جاري تأكيد الدفع...</p>
                    <p className="text-xs text-gray-500 mt-1">يرجى الانتظار</p>
                  </div>
                )}

                {error && (
                  <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-red-50 border border-red-200">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs font-black">!</span>
                    </div>
                    <p className="font-semibold text-red-700 text-right leading-relaxed">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-6 rounded-xl text-center bg-emerald-50 border border-emerald-200">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={24} className="text-emerald-600" />
                    </div>
                    <p className="font-bold text-emerald-800 text-base mb-1">تم الدفع بنجاح</p>
                    <p className="text-emerald-600 text-xs mb-4">جاري تحويلك للصفحة الرئيسية...</p>
                    {paymentData && (
                      <div className="bg-white border border-emerald-100 rounded-xl p-3.5 text-right space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-700 font-mono font-semibold">#{paymentData.PaymentID}</span>
                          <span className="text-gray-500">رقم العملية</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-700 font-semibold">{paymentData.PaymentMethod || 'بطاقة ائتمانية'}</span>
                          <span className="text-gray-500">طريقة الدفع</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-100">
                          <span className="font-black text-gray-900">{parseFloat(paymentData.Amount).toLocaleString()} ر.س</span>
                          <span className="text-gray-500">المبلغ المدفوع</span>
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

      <footer className="border-t border-gray-200 mt-12 py-5 bg-white">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default PaymentPage;