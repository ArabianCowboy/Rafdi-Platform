import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'حدث خطأ، تأكد من البريد الإلكتروني'); return; }
      setSuccess('تم إرسال رمز التحقق على بريدك الإلكتروني');
      setStep(2);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) { setError('يرجى إدخال رمز التحقق'); return; }
    if (!newPassword) { setError('يرجى إدخال كلمة المرور الجديدة'); return; }
    if (newPassword.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'رمز التحقق غير صحيح أو منتهي الصلاحية'); return; }
      setSuccess('تم تغيير كلمة المرور بنجاح!');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{background: 'linear-gradient(135deg, #0f2744 0%, #1a3f6f 40%, #2E5F8A 100%)'}}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{background: 'radial-gradient(circle, #4A8ABF, transparent)'}} />

        {/* Step Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-16">
          <div className="flex flex-col gap-6">
            {[
              { num: 1, label: 'أدخل بريدك الإلكتروني', desc: 'سنرسل لك رمز التحقق' },
              { num: 2, label: 'أدخل رمز التحقق', desc: 'تحقق من بريدك الإلكتروني' },
              { num: 3, label: 'كلمة مرور جديدة', desc: 'اختر كلمة مرور قوية' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all"
                  style={{
                    background: step >= s.num ? 'white' : 'rgba(255,255,255,0.1)',
                    color: step >= s.num ? '#2E5F8A' : 'rgba(255,255,255,0.4)',
                  }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <div>
                  <p className="font-black text-sm" style={{color: step >= s.num ? 'white' : 'rgba(255,255,255,0.4)'}}>{s.label}</p>
                  <p className="text-xs" style={{color: 'rgba(255,255,255,0.3)'}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-end items-start p-16 w-full pb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
              <span className="text-white font-black text-lg">ر</span>
            </div>
            <span className="text-white font-black text-2xl">رفدي</span>
          </div>
          <p className="text-white/40 text-sm font-bold">© 2026 Rafdi Platform</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#2E5F8A] font-bold text-sm mb-8 transition-colors">
            <ArrowLeft size={16} className="rotate-180" />
            العودة لتسجيل الدخول
          </Link>

          {/* Header */}
          <div className="mb-8 text-right">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mr-auto"
              style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#0f2744] mb-2">
              {step === 1 ? 'نسيت كلمة المرور؟ 🔑' : 'أدخل رمز التحقق 📩'}
            </h2>
            <p className="text-gray-400 font-medium">
              {step === 1
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق'
                : `تم إرسال رمز التحقق إلى ${email}`}
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl text-sm flex items-center gap-3"
                style={{background: '#FEF2F2', border: '1px solid #FCA5A5'}}>
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-500 font-black text-lg">!</div>
                <p className="font-bold text-red-700 text-right">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl text-sm flex items-center gap-3"
                style={{background: '#F0FDF4', border: '1px solid #86EFAC'}}>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-500 text-lg">✓</div>
                <p className="font-bold text-emerald-700 text-right">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Email */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="name@company.com"
                      className="w-full py-4 px-5 pr-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                      onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                      onBlur={e => e.target.style.borderColor = 'transparent'}
                      value={email} onChange={e => { setEmail(e.target.value); if(error) setError(''); }} />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  </div>
                </div>

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 disabled:opacity-70"
                  style={{background: loading ? '#93b4d4' : 'linear-gradient(135deg, #1a3f6f 0%, #2E5F8A 100%)', boxShadow: '0 8px 32px rgba(46,95,138,0.35)'}}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />
                      جاري الإرسال...
                    </span>
                  ) : 'إرسال رمز التحقق'}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: OTP + New Password */}
            {step === 2 && (
              <motion.form key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword} className="space-y-5">

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">
                    رمز التحقق
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="أدخل الرمز المرسل إلى بريدك"
                      className="w-full py-4 px-5 pr-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744] tracking-widest"
                      onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                      onBlur={e => e.target.style.borderColor = 'transparent'}
                      value={otp} onChange={e => { setOtp(e.target.value); if(error) setError(''); }} />
                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      className="w-full py-4 px-5 pr-12 pl-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                      onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                      onBlur={e => e.target.style.borderColor = 'transparent'}
                      value={newPassword} onChange={e => { setNewPassword(e.target.value); if(error) setError(''); }} />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 disabled:opacity-70"
                  style={{background: loading ? '#93b4d4' : 'linear-gradient(135deg, #1a3f6f 0%, #2E5F8A 100%)', boxShadow: '0 8px 32px rgba(46,95,138,0.35)'}}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />
                      جاري التغيير...
                    </span>
                  ) : 'تغيير كلمة المرور'}
                </motion.button>

                <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                  className="w-full py-3 rounded-2xl font-bold text-gray-400 hover:text-[#2E5F8A] text-sm transition-colors">
                  لم تستلم الرمز؟ أعد الإرسال
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-gray-400 font-bold mt-8">
            © 2026 Rafdi Platform — جميع الحقوق محفوظة
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;