import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle, ShieldCheck, Loader } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';
const MOYASAR_KEY = 'pk_test_xZj2Ucqc3pVSkktyUTZLs1ER6JhSKxj4Pnwvt8Ds';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // نحفظ bookingId في sessionStorage عشان ما يضيع بعد redirect
  const bookingIdFromState = location.state?.bookingId;
  const warehouseNameFromState = location.state?.warehouseName;
  const estimatedPriceFromState = location.state?.estimatedPrice;

  if (bookingIdFromState) {
    sessionStorage.setItem('bookingId', bookingIdFromState);
    sessionStorage.setItem('warehouseName', warehouseNameFromState || 'المستودع');
    sessionStorage.setItem('estimatedPrice', estimatedPriceFromState || 0);
  }

  const bookingId = bookingIdFromState || sessionStorage.getItem('bookingId');
  const warehouseName = warehouseNameFromState || sessionStorage.getItem('warehouseName') || 'المستودع';
  const estimatedPrice = parseFloat(estimatedPriceFromState || sessionStorage.getItem('estimatedPrice') || 0);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const processBackendPayment = async (moyasarPaymentId, moyasarStatus, paymentMethod) => {
    if (processing) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        booking_id: bookingId,
        moyasar_payment_id: moyasarPaymentId,
        moyasar_status: moyasarStatus,
        payment_method: paymentMethod || 'creditcard',
      });

      const res = await fetch(`${API_URL}/payments/?${params}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'حدث خطأ أثناء تأكيد الدفع');
        return;
      }
      setPaymentData(data);
      setSuccess(true);
      sessionStorage.removeItem('bookingId');
      sessionStorage.removeItem('warehouseName');
      sessionStorage.removeItem('estimatedPrice');
      setTimeout(() => navigate('/home'), 3000);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!bookingId) { navigate('/home'); return; }

    // تحقق من callback بعد redirect من ميسر
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

    // تحميل Moyasar
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
        amount: Math.round(estimatedPrice * 100),
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
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#2E5F8A] font-bold text-sm transition-colors">
            <ArrowLeft size={18} className="rotate-180" />
            رجوع
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
              <span className="text-white font-black text-sm">ر</span>
            </div>
            <span className="text-[#0f2744] font-black">رفدي</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left - Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="p-6 text-right"
                style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">ملخص الطلب</p>
                <h3 className="text-xl font-black text-white">{warehouseName}</h3>
              </div>
              <div className="p-6 space-y-4 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-[#2E5F8A] font-black text-2xl">{estimatedPrice.toLocaleString()} ر.س</span>
                  <span className="text-gray-400 text-sm font-bold">المبلغ الإجمالي</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100">
                  <span className="font-bold text-emerald-500">آمن ومشفر 🔒</span>
                  <span className="text-gray-400 font-bold">حالة الدفع</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4 justify-end">
                <h3 className="font-black text-[#0f2744]">معلومات الأمان</h3>
                <ShieldCheck size={20} className="text-[#2E5F8A]" />
              </div>
              <div className="space-y-3">
                {[
                  { icon: '🔒', text: 'جميع البيانات مشفرة بالكامل' },
                  { icon: '✅', text: 'دفع آمن عبر ميسر' },
                  { icon: '🛡️', text: 'بيانات بطاقتك محمية ولا تُخزن' },
                  { icon: '🍎', text: 'يدعم Apple Pay' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 justify-end text-sm text-gray-500">
                    <span className="font-medium">{item.text}</span>
                    <span>{item.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Moyasar Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 text-right"
                style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">إتمام الدفع</p>
                <h3 className="text-2xl font-black text-white">ادفع بأمان عبر ميسر</h3>
              </div>

              <div className="p-6">
                <AnimatePresence>
                  {processing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mb-6 p-6 rounded-2xl text-center"
                      style={{background: 'rgba(46,95,138,0.05)', border: '1px solid rgba(46,95,138,0.1)'}}>
                      <Loader size={40} className="text-[#2E5F8A] animate-spin mx-auto mb-3" />
                      <p className="font-black text-[#0f2744]">جاري تأكيد الدفع...</p>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-6 p-4 rounded-2xl text-sm flex items-start gap-3"
                      style={{background: '#FEF2F2', border: '1px solid #FCA5A5'}}>
                      <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-500 font-black mt-0.5">!</div>
                      <p className="font-bold text-red-700 text-right leading-relaxed">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-2xl text-center"
                      style={{background: '#F0FDF4', border: '1px solid #86EFAC'}}>
                      <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                      <p className="font-black text-emerald-700 text-xl mb-1">تم الدفع بنجاح! 🎉</p>
                      <p className="text-emerald-600 text-sm font-medium">جاري تحويلك للصفحة الرئيسية...</p>
                      {paymentData && (
                        <div className="mt-4 pt-4 border-t border-emerald-100 text-right space-y-2">
                          <p className="text-xs text-emerald-600 font-bold">رقم العملية: #{paymentData.PaymentID}</p>
                          <p className="text-xs text-emerald-600 font-bold">طريقة الدفع: {paymentData.PaymentMethod || 'بطاقة ائتمانية'}</p>
                          <p className="text-xs text-emerald-600 font-bold">المبلغ: {parseFloat(paymentData.Amount).toLocaleString()} ر.س</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!success && !processing && (
                  <div className="moyasar-form-wrapper" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;