import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ArrowLeft, CheckCircle, Loader, ShieldCheck, Lock } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId;
  const warehouseName = location.state?.warehouseName || 'المستودع';
  const estimatedPrice = location.state?.estimatedPrice || 0;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      navigate('/home');
    }
  }, [bookingId]);

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!cardName) { setError('يرجى إدخال اسم صاحب البطاقة'); return; }
    if (cardNumber.replace(/\s/g, '').length < 16) { setError('يرجى إدخال رقم بطاقة صحيح'); return; }
    if (expiry.length < 5) { setError('يرجى إدخال تاريخ انتهاء صحيح'); return; }
    if (cvv.length < 3) { setError('يرجى إدخال رمز CVV صحيح'); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/payments/?booking_id=${bookingId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setError('عذراً، ليس لديك صلاحية لإتمام هذا الدفع');
        } else {
          setError(data.detail || 'حدث خطأ أثناء معالجة الدفع');
        }
        return;
      }
      setPaymentData(data);
      setSuccess(true);
      setTimeout(() => navigate('/home'), 3000);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

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

            {/* Summary Card */}
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
                <div className="flex justify-between items-center text-sm text-gray-400 pt-3 border-t border-gray-100">
                  <span className="font-bold text-emerald-500">آمن ومشفر 🔒</span>
                  <span className="font-bold">حالة الدفع</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4 justify-end">
                <h3 className="font-black text-[#0f2744]">معلومات الأمان</h3>
                <ShieldCheck size={20} className="text-[#2E5F8A]" />
              </div>
              <div className="space-y-3">
                {[
                  { icon: '🔒', text: 'جميع البيانات مشفرة بالكامل' },
                  { icon: '✅', text: 'دفع آمن ومعتمد' },
                  { icon: '🛡️', text: 'بيانات بطاقتك محمية ولا تُخزن' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 justify-end text-sm text-gray-500">
                    <span className="font-medium">{item.text}</span>
                    <span>{item.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Payment Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 text-right"
                style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">إتمام الدفع</p>
                <h3 className="text-2xl font-black text-white flex items-center justify-end gap-2">
                  <CreditCard size={24} />
                  بيانات البطاقة
                </h3>
              </div>

              <div className="p-6">
                <AnimatePresence>
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
                      className="mb-6 p-6 rounded-2xl text-center"
                      style={{background: '#F0FDF4', border: '1px solid #86EFAC'}}>
                      <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                      <p className="font-black text-emerald-700 text-xl mb-1">تم الدفع بنجاح! 🎉</p>
                      <p className="text-emerald-600 text-sm font-medium">جاري تحويلك للصفحة الرئيسية...</p>
                      {paymentData && (
                        <div className="mt-4 pt-4 border-t border-emerald-100 text-right space-y-1">
                          <p className="text-xs text-emerald-600 font-bold">رقم العملية: #{paymentData.PaymentID}</p>
                          <p className="text-xs text-emerald-600 font-bold">المبلغ: {parseFloat(paymentData.Amount).toLocaleString()} ر.س</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!success && (
                  <form onSubmit={handlePayment} className="space-y-5 text-right">

                    {/* Card Name */}
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                        اسم صاحب البطاقة
                      </label>
                      <input type="text" placeholder="الاسم كما يظهر على البطاقة"
                        className="w-full py-4 px-5 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300"
                        onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                        onBlur={e => e.target.style.borderColor = 'transparent'}
                        value={cardName}
                        onChange={e => { setCardName(e.target.value); if(error) setError(''); }} />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                        رقم البطاقة
                      </label>
                      <div className="relative">
                        <input type="text" placeholder="0000 0000 0000 0000"
                          className="w-full py-4 px-5 pr-12 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300 tracking-widest"
                          onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                          onBlur={e => e.target.style.borderColor = 'transparent'}
                          value={cardNumber}
                          onChange={e => { setCardNumber(formatCardNumber(e.target.value)); if(error) setError(''); }} />
                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                          تاريخ الانتهاء
                        </label>
                        <input type="text" placeholder="MM/YY"
                          className="w-full py-4 px-5 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300 text-center tracking-widest"
                          onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                          onBlur={e => e.target.style.borderColor = 'transparent'}
                          value={expiry}
                          onChange={e => { setExpiry(formatExpiry(e.target.value)); if(error) setError(''); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                          CVV
                        </label>
                        <div className="relative">
                          <input type={showCvv ? 'text' : 'password'} placeholder="000"
                            maxLength={4}
                            className="w-full py-4 px-5 pl-10 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300 text-center tracking-widest"
                            onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                            value={cvv}
                            onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); if(error) setError(''); }} />
                          <button type="button" onClick={() => setShowCvv(!showCvv)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                            <Lock size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <motion.button type="submit" disabled={submitting}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
                      style={{background: submitting ? '#93b4d4' : 'linear-gradient(135deg, #1a3f6f 0%, #2E5F8A 100%)', boxShadow: '0 8px 32px rgba(46,95,138,0.35)'}}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />
                          جاري معالجة الدفع...
                        </span>
                      ) : (
                        <>
                          <ShieldCheck size={20} />
                          ادفع الآن {estimatedPrice > 0 && `- ${estimatedPrice.toLocaleString()} ر.س`}
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-xs text-gray-400 font-bold">
                      🔒 جميع المعاملات مشفرة وآمنة
                    </p>
                  </form>
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